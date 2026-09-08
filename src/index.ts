import readline from "readline";
import fs from "fs";
import path from "path";
import { chat } from "./chatbot";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

type Message = {
  role: "user" | "model";
  text: string;
};

const history: Message[] = [];

function askUser(question: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(question, resolve);
  });
}

async function main() {
  console.log("\n=================================");
  console.log("   Loan Requirement Assistant");
  console.log("=================================\n");

  console.log(
    "Tell me what kind of loan you are looking for.\n"
  );

  while (true) {
    const userInput = await askUser("You: ");

    if (
      userInput.toLowerCase() === "exit" ||
      userInput.toLowerCase() === "quit"
    ) {
      console.log("\nGoodbye!");
      break;
    }

    history.push({
      role: "user",
      text: userInput
    });

    try {
      const result = await chat(history);

      history.push({
        role: "model",
        text: result.text
      });

      console.log(`\nAI: ${result.text}\n`);

      if (result.completed && result.requirements) {
        const outputPath = path.join(
          process.cwd(),
          "data",
          "user-requirements.json"
        );

        fs.mkdirSync(path.dirname(outputPath), {
          recursive: true
        });

        fs.writeFileSync(
          outputPath,
          JSON.stringify(
            result.requirements,
            null,
            2
          )
        );

        console.log(
          "✓ All required information collected."
        );

        console.log(
          `✓ Data saved to ${outputPath}\n`
        );

        break;
      }
    } catch (error) {
      console.error("\nError:", error);
    }
  }

  rl.close();
}

main();