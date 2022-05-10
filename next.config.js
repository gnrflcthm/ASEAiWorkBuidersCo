module.exports = {
    async redirects() {
        return [
            {
                source: "/",
                destination: "/home",
                permanent: true,
            },
        ];
    },
    images: {
        domains: [
            "pixelartmaker-data-78746291193.nyc3.digitaloceanspaces.com",
            "res.cloudinary.com",
        ],
    },
    env: {
        CLOUDINARY_UPLOAD_URL:
            "https://api.cloudinary.com/v1_1/aseabuildersco/image/upload",
        CLOUDINARY_DELETE_URL:
            "https://api.cloudinary.com/v1_1/aseabuildersco/image/destroy",
        CLOUDINARY_SERVICES_PRESET: "tb8uuulf",
        CLOUDINARY_WORKS_PRESET: "khivn4nt",
        CLOUDINARY_CERTIFICATIONS_PRESET: "kkjzhy8n",
        CLOUDINARY_OFFERS_PRESET: "nk4qzayp",
        DEFAULT_ADMIN_PASSWORD: "ASEABuildersCo@2022",
    },
};
