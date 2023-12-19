export const PARTICLES_OPTION = {
  fpsLimit: 60,
  fullScreen: {
    enable: true,
    zIndex: -1,
  },
  particles: {
    number: { value: 50 },
    color: { value: ["#94E0ED", "#F97316"] },
    shape: { type: 'circle' },
    opacity: { value: 0.5 },
    size: { value: { min: 1, max: 3 } },
    links: {
      enable: true,
      distance: 100,
      color: 'random',
      opacity: 0.4,
      width: 1,
      triangles: {
        enable: true,
        color: '#EAEDED',
        opacity: 0.1,
      },
    },
    move: {
      enable: true,
      speed: 1,
      direction: 'none',
      outModes: 'out',
    },
  },
  interactivity: {
    events: {
      onClick: {
        enable: true,
        mode: 'push',
      },
    },
    modes: {
      repulse: { distance: 200 },
      push: { quantity: 4 },
    },
  },
  background: { color: '#ffffff' },
};
