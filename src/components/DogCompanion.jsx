import { useEffect, useState, lazy, Suspense } from "react";
import DachshundCompanion from "./DachshundCompanion.jsx";

// 3D procedural dog is the fallback until real PNGs are added to /public/dog/.
const DachshundScene = lazy(() => import("./DachshundScene.jsx"));

export default function DogCompanion() {
  const [hasPhoto, setHasPhoto] = useState(null); // null = checking

  useEffect(() => {
    let alive = true;
    const img = new Image();
    img.onload = () => alive && setHasPhoto(true);
    img.onerror = () => alive && setHasPhoto(false);
    img.src = "/dog/dog-peek.png";
    return () => { alive = false; };
  }, []);

  if (hasPhoto === null) return null;            // still checking — render nothing
  if (hasPhoto) return <DachshundCompanion onBroken={() => setHasPhoto(false)} />;
  return (
    <Suspense fallback={null}>
      <DachshundScene />
    </Suspense>
  );
}
