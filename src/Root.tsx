import React from "react";
import { Composition } from "remotion";
import { SkillIntro } from "./SkillIntro";
import { DURATION_FRAMES, FPS, HEIGHT, WIDTH } from "./config";

export const Root: React.FC = () => (
  <Composition
    id="SkillRemotion"
    component={SkillIntro}
    durationInFrames={DURATION_FRAMES}
    fps={FPS}
    width={WIDTH}
    height={HEIGHT}
  />
);
