import { driver } from 'driver.js';

export function startTutorial(onDone?: () => void) {
  const tour = driver({
    showProgress: true,
    popoverClass: 'life-tour',
    nextBtnText: 'Suivant →',
    prevBtnText: '← Retour',
    doneBtnText: 'C’est parti !',
    progressText: '{{current}} / {{total}}',
    onDestroyed: () => onDone?.(),
    steps: [
      { popover: { title: 'Bienvenue dans ta nouvelle vie 👶', description: 'Tu viens de naître quelque part parmi 8 milliards d’humains. Voici comment vivre ta vie.' } },
      { element: '#tour-profile', popover: { title: 'Ton identité', description: 'Ton nom, ton âge, ton pays, ton métier et ton argent.' } },
      { element: '#tour-stats', popover: { title: 'Tes statistiques', description: 'Santé, bonheur, intelligence, apparence et forme. Si ta santé tombe à 0… c’est la fin.' } },
      { element: '#tour-log', popover: { title: 'Le journal de ta vie', description: 'Chaque année, il t’arrive des choses. Tout est raconté ici.' } },
      { element: '#tour-tabs', popover: { title: 'Agis sur ta vie', description: 'Études, carrière, relations, activités, achats et bourse. Glisse vers la gauche ou la droite pour changer d’onglet.' } },
      { element: '#tour-age', popover: { title: 'Vieillir', description: 'Appuie ici (ou sur Espace) pour passer à l’année suivante. Ctrl+K ouvre la palette de commandes.' } },
    ],
  });
  tour.drive();
}
