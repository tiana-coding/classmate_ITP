export interface Badge {
    level: number;
    title: string;
    image: string;
    lockedImage: string;
    unlocked: boolean;
    unlockMessage: string;
}

export function getBadges(currentLevel: number): Badge[] {
    const badgeData = [
        { level: 1,   title: 'Newcomer'   },
        { level: 5,   title: 'Explorer'   },
        { level: 10,  title: 'Coder'      },
        { level: 25,  title: 'Mentor'     },
        { level: 50,  title: 'Mastermind' },
        { level: 100, title: 'Legend'     },
    ];

    // Relativer Pfad von deiner HTML-Datei aus:
    const basePath = '../assets/images/badges/';

    return badgeData.map(({ level, title }) => {
        const name     = title.toLowerCase();
        const unlocked = currentLevel >= level;
        return {
            level,
            title,
            image:       `${basePath}${name}.png`,
            lockedImage: `${basePath}${name}_locked.png`,
            unlocked,
            unlockMessage: `Erreiche Level ${level}, um dieses Abzeichen freizuschalten`
        };
    });
}
