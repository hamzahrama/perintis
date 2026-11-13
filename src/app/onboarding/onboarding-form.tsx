"use client";

import { useActionState } from "react";
import { Button, Notice, TextInput } from "@/components/ui";
import { saveOnboardingAction } from "./actions";

export type OnboardingFormState = {
  error?: string;
  success?: string;
};

type OnboardingFormProps = {
  fullName: string;
};

export function OnboardingForm({ fullName }: OnboardingFormProps) {
  const [state, formAction, isPending] = useActionState(
    saveOnboardingAction,
    {},
  );

  return (
    <form action={formAction} className="onboarding-form">
      <label className="form-field">
        Kondisi (Condition)
        <TextInput
          autoComplete="name"
          defaultValue={fullName}
          maxLength={200}
          name="condition"
          required
        />
      </label>

      <label className="form-field">
        Minat (Interests)
        <TextInput
          name="interests"
          placeholder="Contoh: programming, travel..."
          maxLength={400}
          required
          type="text"
        />
      </label>

      <label className="form-field">
        Tantangan (Challenges)
        <TextInput
          name="challenges"
          placeholder="Contoh: waktu, fokus..."
          maxLength={400}
          required
          type="text"
        />
      </label>

      <label className="form-field">
        Arah (Direction)
        <TextInput
          name="direction"
          placeholder="Contoh: career, study..."
          maxLength={400}
          required
          type="text"
        />
      </label>

      {state.error && <Notice tone="error">{state.error}</Notice>}
      {state.success && <Notice tone="success">{state.success}</Notice>}
      <Button disabled={isPending} type="submit">
        {isPending ? "Menyimpan..." : "Simpan onboarding"}
      </Button>
    </form>
  );
}