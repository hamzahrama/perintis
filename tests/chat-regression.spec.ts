import { expect, test } from "@playwright/test";
import { contentSchema, conversationSchema, idSchema } from "../src/lib/assistant/schemas";

test.describe("Chat Regression & Integrity", () => {
  test.describe("Message length validation (4,000 char boundary)", () => {
    test("accepts content up to 4000 characters", () => {
      const validBoundary = "a".repeat(4000);
      const result = contentSchema.safeParse(validBoundary);
      expect(result.success).toBe(true);
    });

    test("rejects content exceeding 4000 characters", () => {
      const invalidOver = "a".repeat(4001);
      const result = contentSchema.safeParse(invalidOver);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBeDefined();
      }
    });

    test("rejects empty or whitespace-only messages", () => {
      expect(contentSchema.safeParse("").success).toBe(false);
      expect(contentSchema.safeParse("   ").success).toBe(false);
    });
  });

  test.describe("Conversation ID & Title validation", () => {
    test("validates UUID for conversation ID", () => {
      expect(idSchema.safeParse("123e4567-e89b-12d3-a456-426614174000").success).toBe(true);
      expect(idSchema.safeParse("invalid-uuid").success).toBe(false);
    });

    test("validates conversation title boundaries", () => {
      expect(conversationSchema.safeParse({ title: "Valid Title" }).success).toBe(true);
      expect(conversationSchema.safeParse({ title: "" }).success).toBe(false);
      expect(conversationSchema.safeParse({ title: "a".repeat(121) }).success).toBe(false);
    });
  });
});
