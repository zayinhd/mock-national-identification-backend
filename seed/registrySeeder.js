require("dotenv").config();

const fs = require("fs");
const path = require("path");

const citizens = require("./data");

const supabase = require("../src/config/supabase");

const {
    loadModels,
    generateDescriptor,
} = require("../src/services/face.service");

async function seedRegistry() {
    try {
        console.log("Loading models...");
        await loadModels();

        for (const citizen of citizens) {
            console.log(`Processing ${citizen.fullName}`);

            const imagePath = path.join(__dirname, "images", citizen.image);

            const descriptor = await generateDescriptor(imagePath);

            const imageBuffer = fs.readFileSync(imagePath);

            const storagePath = `${citizen.nationalId}.jpg`;

            const { error: uploadError } = await supabase.storage
                .from("national-registry")
                .upload(storagePath, imageBuffer, {
                    contentType: "image/jpeg",
                    upsert: true,
                });

            if (uploadError) {
                console.log(uploadError);
                continue;
            }

            const { data: publicData } = supabase.storage
                .from("national-registry")
                .getPublicUrl(storagePath);

            const { error: insertError } = await supabase
                .from("national_registry")
                .insert({
                    national_id_number: citizen.nationalId,

                    full_name: citizen.fullName,

                    date_of_birth: citizen.dateOfBirth,

                    gender: citizen.gender,

                    photo_url: publicData.publicUrl,

                    face_descriptor: descriptor,
                });

            if (insertError) {
                console.log(insertError);
            }

            console.log(`${citizen.fullName} inserted`);
        }

        console.log("Seeding complete");
    } catch (err) {
        console.error(err);
    }
}

seedRegistry();
