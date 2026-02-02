import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
    console.log("🌱 Seeding AI Tutor Scenarios...");

    const scenarios = [
        {
            slug: "kennismaking",
            title: "Kennismaken",
            description: "Introduce yourself and learn basic greetings in Javanese.",
            initialMessage: "Halo! 👋 Jenengku Furnie. Jenengmu sapa? Senang bisa ketemu kowe!",
            initialSuggestions: ["Jenengku Budi", "Kowe asale saka ngendi?"],
            category: "Recommended",
            icon: "waving_hand",
            moduleId: "mod-1",
            order: 1
        },
        {
            slug: "familie",
            title: "Familie & Thuis",
            description: "Talk about your family members and where you live.",
            initialMessage: "Halo! 👋 Ayo crito bareng babagan familie. Pira sedulurmu?",
            initialSuggestions: ["Aku duwe sedulur loro", "Bapakku jenenge Slamet"],
            category: "Recommended",
            icon: "family_restroom",
            moduleId: "mod-2",
            order: 2
        },
        {
            slug: "pasar",
            title: "Bargaining at Pasar Gede",
            description: "Learn numbers and bargaining phrases in a busy market setting.",
            initialMessage: "Sugeng rawuh ing Pasar Gede! 🌶️ Arep blonjo opo dina iki? Regane murah-murah lho!",
            initialSuggestions: ["Iki regane pira?", "Beras sekilo pira?"],
            category: "Daily Life",
            icon: "payments",
            moduleId: "mod-3",
            order: 3
        },
        {
            slug: "warung",
            title: "Ordering at a Warung",
            description: "Practice ordering food in Ngoko & Krama Alus with a local vendor.",
            initialMessage: "Sugeng rawuh! 👋 Arep pesen opo nang warung iki? Kene ono soto, rawon, karo gudeg.",
            initialSuggestions: ["Soto ayam siji", "Kula nyuwun rawon"],
            category: "Daily Life",
            icon: "restaurant",
            moduleId: "mod-5",
            order: 4
        }
    ];

    for (const s of scenarios) {
        await prisma.aITutorScenario.upsert({
            where: { slug: s.slug },
            update: s,
            create: s
        });
    }

    console.log("✅ Scenarios seeded successfully!");
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
