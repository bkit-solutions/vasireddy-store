import { Suspense } from "react";
import CollectionsClient from "./CollectionsClient";

export default function CollectionsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white" />}>
      <CollectionsClient />
    </Suspense>
  );
}
