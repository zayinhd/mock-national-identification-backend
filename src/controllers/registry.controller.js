const fs = require("fs");

const supabase = require("../config/supabase");

const { generateDescriptor } = require("../services/face.service");

exports.renderRegistryPage = (req, res) => {
    res.render("NationalRegistry");
};

exports.createCitizen = async (req, res) => {
    try {
        const {
            nationalId,
            fullName,
            dateOfBirth,
            gender,
            phone,
            address,
            placeOfBirth,
            nationality,
        } = req.body;

        if (!req.file) {
            return res.status(400).send("Photo required");
        }

        const descriptor = await generateDescriptor(req.file.path);

        const imageBuffer = fs.readFileSync(req.file.path);

        const fileName = `${nationalId}.jpg`;

        const { error: uploadError } = await supabase.storage
            .from("national-registry")
            .upload(fileName, imageBuffer, {
                upsert: true,
                contentType: "image/jpeg",
            });

        if (uploadError) throw uploadError;

        const { data: publicData } = supabase.storage
            .from("national-registry")
            .getPublicUrl(fileName);

        const { error: insertError } = await supabase
            .from("national_registry")
            .insert({
                national_id_number: nationalId,

                full_name: fullName,

                date_of_birth: dateOfBirth,

                gender,

                phone,

                address,

                place_of_birth: placeOfBirth,

                nationality,

                photo_url: publicData.publicUrl,

                face_descriptor: descriptor,
            });

        if (insertError) throw insertError;

        fs.unlinkSync(req.file.path);

        return res.redirect("/registry");
    } catch (error) {
        console.error(error);

        return res.status(500).send(error.message);
    }
};
