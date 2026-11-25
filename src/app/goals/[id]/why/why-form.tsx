"use client";

import { useActionState } from "react";
import { Button, Notice, TextInput } from "@/components/ui";
import { saveWhyAction } from "./actions";

type WhyFormProps = {
  goalId: string;
  initialStatement: string;
};

export function WhyForm({ goalId, initialStatement }: WhyFormProps) {
  const [state, formAction, isPending] = useActionState(saveWhyAction, {});

  return (
    <form action={formAction} className="goal-form">
      <input type="hidden" name="goalId" value={goalId} />
      <label className="form-field">
        Alasan pribadi
        <TextInput
          defaultValue={initialStatement}
          maxLength={1000}
          name="statement"
          placeholder="Contoh: Saya ingin lebih konsisten jadi lebih sehat"
          required
        />
      </label>
      {state.error && <Notice tone="error">{state.error}</Notice>}
      {state.success && <Notice tone="success">{state.success}</Notice>}
      <Button disabled={isPending} type="submit">
        {isPending ? "Menyimpan..." : "Simpan alasan"}
      </Button>
    </form>
  );
}