import { ai } from "./gemini";
import {
    UserRequirementsSchema,
    UserRequirements
} from "./schema";

const SYSTEM_INSTRUCTION = `
You are a loan requirement collection assistant.

Your job is ONLY to collect user requirements for a loan application.

Information to collect dynamically based on the loan purpose:

1. purpose (e.g. business, education, agriculture, personal, other)
2. activity:
   - When purpose is "business", proactively present multiple clear options in your reply (e.g. 1. Startup, 2. Local Shop/Retail, 3. Manufacturing, 4. Service Business, 5. Other).
   - When purpose is "education", proactively present options in your reply (e.g. 1. Higher Education / Graduation, 2. Vocational / Skill Course, 3. Overseas Studies, 4. Other).
   - When purpose is "agriculture", present options (e.g. 1. Farming / Crop Production, 2. Dairy / Animal Husbandry, 3. Fisheries, 4. Equipment Purchase, 5. Other).
3. loan_amount (Numeric amount in INR)
4. Cost field (DEPENDS ON PURPOSE):
   - If purpose is "education": collect "course_fees" (Numeric amount in INR). Do NOT ask for project_cost (leave project_cost as null).
   - If purpose is "business", "agriculture", or "other": collect "project_cost" (Numeric amount in INR). Do NOT ask for course_fees (leave course_fees as null).
5. annual_family_income (Numeric amount in INR)
6. is_sc (boolean: true/false)

Do NOT recommend any loan scheme.
Do NOT determine eligibility.
Do NOT make financial decisions.

Your job is to have a natural conversation and collect the missing information.

Rules:
- Extract information that the user already provides.
- Do not ask for information that is already known.
- Ask only ONE question at a time.
- When asking for activity, provide multiple options so the user can easily select or type their choice.
- For money amounts, allow the user to give natural numbers or text (e.g. "2 lakh" -> 200000, "3.5 lakh" -> 350000).
- If the user says "yes" to being SC, is_sc should be true; if "no", is_sc should be false.
- Do not invent information. Unknown values must remain null.
- Set completed to true ONLY when purpose, activity, loan_amount, annual_family_income, is_sc, AND the relevant cost field (course_fees for education OR project_cost for business/others) are all filled and non-null.
`;

type GeminiMessage = {
    role: "user" | "model";
    text: string;
};

export async function chat(
    history: GeminiMessage[]
): Promise<{
    text: string;
    completed: boolean;
    requirements: UserRequirements | null;
}> {
    const response = await ai.models.generateContent({
        model: "gemini-3.6-flash",
        contents: history.map((message) => ({
            role: message.role,
            parts: [{ text: message.text }]
        })),
        config: {
            systemInstruction: SYSTEM_INSTRUCTION,
            responseMimeType: "application/json",
            responseSchema: {
                type: "OBJECT",
                properties: {
                    reply: {
                        type: "STRING"
                    },
                    completed: {
                        type: "BOOLEAN"
                    },
                    requirements: {
                        type: "OBJECT",
                        properties: {
                            purpose: {
                                type: "STRING",
                                nullable: true
                            },
                            activity: {
                                type: "STRING",
                                nullable: true
                            },
                            loan_amount: {
                                type: "NUMBER",
                                nullable: true
                            },
                            project_cost: {
                                type: "NUMBER",
                                nullable: true
                            },
                            course_fees: {
                                type: "NUMBER",
                                nullable: true
                            },
                            annual_family_income: {
                                type: "NUMBER",
                                nullable: true
                            },
                            is_sc: {
                                type: "BOOLEAN",
                                nullable: true
                            }
                        },
                        required: [
                            "purpose",
                            "activity",
                            "loan_amount",
                            "project_cost",
                            "course_fees",
                            "annual_family_income",
                            "is_sc"
                        ]
                    }
                },
                required: [
                    "reply",
                    "completed",
                    "requirements"
                ]
            }
        }
    });

    const rawText = response.text;

    if (!rawText) {
        throw new Error("Gemini returned an empty response");
    }

    let result: any;

    try {
        result = JSON.parse(rawText);
    } catch {
        throw new Error(
            `Gemini returned invalid JSON:\n${rawText}`
        );
    }

    const validation =
        UserRequirementsSchema.safeParse(result.requirements);

    if (!validation.success) {
        throw new Error(validation.error.message);
    }

    return {
        text: result.reply,
        completed: Boolean(result.completed),
        requirements: validation.data
    };
}