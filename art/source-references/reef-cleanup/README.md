# Reef Sprite Cleanup

Built-in imagegen edits of the existing game sprites. Each PNG has a matching JSON record containing the exact edit prompt and the visible-eye policy. Original first-pass sources remain in the sibling source-reference folders.

The edit pass simplifies noisy shading and fragmented markings, preserves species and silhouettes, and removes invented central faces. Fish and other animals with visible eyes receive small white highlights in dark sockets. Echinoderms retain natural anatomy rather than a central cartoon face; microscopic eyespots or light-sensing structures are not exaggerated into white eyeballs.

`scripts/prepare_reef_foundations.py --rebuild --check` prepares the cleanup sources, validates all 46 art cards, and includes the existing Sea Star, Crown-of-Thorns and Sea Urchin in the visual review. Sprites remain transparent 64px assets, rendered at 1× and 2×.

Species-specific white-eye coordinates are in the preparation script. Every eye highlight must lie within the creature silhouette. The `NO_FACE` set prevents the pipeline from reintroducing artificial facial eyes.
