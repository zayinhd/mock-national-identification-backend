const path = require("path");
const fs = require("fs");

const supabase = require("../config/supabase");

const {
    generateDescriptor,
    compareDescriptors,
} = require("../services/face.service");

exports.verifyIdentity = async (req, res) => {
    let tempFilePath = null;

    try {
        const { nationalId, userId } = req.body;

        if (!req.file) {
            return res.status(400).json({
                message: "Selfie required",
            });
        }

        tempFilePath = req.file.path;

        const { data: citizen, error } = await supabase
            .from("national_registry")
            .select("*")
            .eq("national_id_number", nationalId)
            .single();

        if (error || !citizen) {
            return res.status(404).json({
                message: "National ID not found",
            });
        }

        const selfieDescriptor = await generateDescriptor(tempFilePath);

        const distance = compareDescriptors(
            citizen.face_descriptor,
            selfieDescriptor,
        );

        const similarity = Math.max(0, (1 - distance) * 100);

        const verified = distance < 0.55;
        const verificationStatus = verified ? "verified" : "failed";

        await supabase.from("verification_logs").insert({
            user_id: userId,
            national_id_number: nationalId,
            similarity_score: similarity,
            success: verified,
        });

        const { error: verificationError } = await supabase
            .from("user_verifications")
            .upsert(
                {
                    user_id: userId,
                    national_registry_id: citizen.id,
                    verification_status: verificationStatus,
                    similarity_score: similarity,
                    verified_at: verified ? new Date().toISOString() : null,
                },
                {
                    onConflict: "user_id",
                },
            );

        if (verificationError) {
            console.error(
                "user_verifications upsert failed",
                verificationError,
            );
            throw verificationError;
        }

        const { error: profileError } = await supabase
            .from("profiles")
            .update({
                is_verified: verified,
                verification_status: verificationStatus,
            })
            .eq("id", userId);

        if (profileError) {
            console.error("profiles update failed", profileError);
            throw profileError;
        }

        return res.json({
            verified,
            similarity,
            citizen: {
                fullName: citizen.full_name,
                nationalId: citizen.national_id_number,
            },
        });
    } catch (error) {
        console.error(error);

        return res.status(500).json({
            message: "Verification failed",
        });
    } finally {
        if (tempFilePath && fs.existsSync(tempFilePath)) {
            try {
                fs.unlinkSync(tempFilePath);
            } catch (cleanupError) {
                console.error("Temporary file cleanup failed", cleanupError);
            }
        }
    }
};
