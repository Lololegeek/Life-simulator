import mitt from 'mitt';

type Events = {
  achievement: { id: string };
  death: { name: string };
  celebrate: { kind: 'wedding' | 'baby' | 'jackpot' | 'promotion' | 'graduation' };
};

/** Cross-cutting game notifications (toasts, sounds, confetti) */
export const bus = mitt<Events>();
