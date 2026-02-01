import { getQuizzes } from "../dal/quizzes";

async function main() {
    console.log("--- QUIZ FILTER & SORT VERIFICATION ---");

    // Test Published Filter
    const { quizzes: publishedQuizzes } = await getQuizzes({ published: true, take: 5 });
    console.log(`Published Quizzes (sample): ${publishedQuizzes.length}`);
    publishedQuizzes.forEach(q => console.log(` - [${q.published ? 'P' : 'D'}] ${q.title}`));

    // Test Module Filter (if modules exist)
    const { quizzes: all } = await getQuizzes({ take: 1 });
    if (all.length > 0 && all[0].lesson?.moduleId) {
        const modId = all[0].lesson.moduleId;
        const { quizzes: moduleQuizzes } = await getQuizzes({ moduleId: modId, take: 5 });
        console.log(`\nModule Filter Test (Module ID: ${modId}):`);
        console.log(`Found ${moduleQuizzes.length} quizzes.`);
    }

    // Test Sorting
    const { quizzes: sortedQuizzes } = await getQuizzes({ sortBy: 'title', sortOrder: 'asc', take: 5 });
    console.log("\nSort Test (Title ASC):");
    sortedQuizzes.forEach(q => console.log(` - ${q.title}`));

    console.log("\n--- END ---");
}

main().catch(console.error);
