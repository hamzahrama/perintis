"use client";

import { useActionState } from "react";
import { Button, Notice, TextInput } from "@/components/ui";
import { createStepAction, deleteStepAction, setStepStatusAction } from "./actions";

type Step = { id: string; title: string; description: string | null; position: number; status: "not_started" | "in_progress" | "completed" };

export function RoadmapClient({ roadmapId, steps }: { roadmapId: string; steps: Step[] }) {
  const [state, action, pending] = useActionState(createStepAction, {});
  return (
    <>
      <form action={action} className="goal-form">
        <input type="hidden" name="roadmapId" value={roadmapId} />
        <input type="hidden" name="position" value={steps.length} />
        <input type="hidden" name="status" value="not_started" />
        <label className="form-field">Langkah baru<TextInput name="title" maxLength={200} required placeholder="Contoh: Cari waktu latihan yang realistis" /></label>
        <label className="form-field">Catatan (opsional)<TextInput name="description" maxLength={1000} placeholder="Detail kecil untuk membantu langkahmu." /></label>
        {state.error && <Notice tone="error">{state.error}</Notice>}
        {state.success && <Notice tone="success">{state.success}</Notice>}
        <Button disabled={pending} type="submit">{pending ? "Menyimpan..." : "Tambah langkah"}</Button>
      </form>
      <ol className="roadmap-steps">
        {steps.map((step, index) => <StepItem key={step.id} roadmapId={roadmapId} step={step} index={index} />)}
      </ol>
    </>
  );
}

function StepItem({ roadmapId, step, index }: { roadmapId: string; step: Step; index: number }) {
  const [state, action, pending] = useActionState(setStepStatusAction, {});
  const [deleteState, deleteAction, deleting] = useActionState(deleteStepAction, {});
  return (
    <li className="roadmap-step">
      <span className="roadmap-step-number">{index + 1}</span>
      <div className="roadmap-step-content">
        <h3>{step.title}</h3>
        {step.description && <p>{step.description}</p>}
      </div>
      <div className="roadmap-step-actions">
        <form action={action}>
          <input type="hidden" name="stepId" value={step.id} />
          <input type="hidden" name="roadmapId" value={roadmapId} />
          <select className="field" name="status" defaultValue={step.status} aria-label={`Status ${step.title}`} disabled={pending}>
            <option value="not_started">Belum mulai</option>
            <option value="in_progress">Berjalan</option>
            <option value="completed">Selesai</option>
          </select>
          <Button disabled={pending} type="submit" variant="secondary">Simpan status</Button>
        </form>
        <form action={deleteAction}>
          <input type="hidden" name="stepId" value={step.id} />
          <Button disabled={deleting} type="submit" variant="ghost">Hapus</Button>
        </form>
        {(state.error || deleteState.error) && <Notice tone="error">{state.error || deleteState.error}</Notice>}
      </div>
    </li>
  );
}