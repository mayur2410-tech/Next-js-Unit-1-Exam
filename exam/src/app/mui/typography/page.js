"use client";

import * as React from "react";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";

export default function TypographyPage() {
  return (
    <Stack spacing={2}>
      <Typography variant="h1">h1 Heading</Typography>
      <Typography variant="h2">h2 Heading</Typography>
      <Typography variant="h3">h3 Heading</Typography>
      <Typography variant="h4">h4 Heading</Typography>
      <Typography variant="h5">h5 Heading</Typography>
      <Typography variant="h6">h6 Heading</Typography>

      <Typography variant="subtitle1">Subtitle 1</Typography>
      <Typography variant="subtitle2">Subtitle 2</Typography>

      <Typography variant="body1">
        Body1 — Lorem ipsum dolor sit amet, consectetur adipiscing elit.
        Pellentesque euismod, urna eu tincidunt consectetur.
      </Typography>
      <Typography variant="body2">
        Body2 — Curabitur blandit tempus porttitor. Integer posuere erat a ante
        venenatis dapibus.
      </Typography>

      <Typography variant="button" display="block">
        Button Text
      </Typography>
      <Typography variant="caption" display="block">
        Caption Text
      </Typography>
      <Typography variant="overline" display="block">
        Overline Text
      </Typography>
    </Stack>
  );
}
