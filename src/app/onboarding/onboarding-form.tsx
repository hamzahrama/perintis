"use client";

import { useActionState } from "react";
import { Button, Notice, TextInput } from "@/components/ui";
import { saveOnboardingAction } from "./actions";

export type OnboardingFormState = {
  error?: string;
  success?: string;
};

export function OnboardingForm() {
  const [state, formAction, isPending] = useActionState(saveOnboardingAction, {});

  return (
    <form action={formAction} className="onboarding-form">
      <label className="form-field">
        Kondisi (Condition)
        <TextInput
          name="condition"
          placeholder="Contoh: Saya baru pindah ke kota baru."
          required
        />
      </label>

      <label className="form-field">
        Minat (Interests)
        <TextInput
          name="interests"
          placeholder="Contoh: belajar coding, membaca, olahraga"
          required
          type="text"
        />
      </label>

      <label className="form-field">
        Tantangan (Challenges)
        <TextInput
          name="challenges"
          placeholder="Contoh: sering lupa, lemot, lemah"
          required
          type="text"
        />
      </label>

      <label className="form-field">
        Arah (Direction)
        <TextInput
          name="direction"
          placeholder="Contoh: jadi lebih produktif, mulai belajar programming"
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
