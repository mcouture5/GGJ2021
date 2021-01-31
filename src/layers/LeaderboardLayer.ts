import { GameManager } from "../GameManager";

export interface LeaderboardData {
    time: number; 
    player0name: string; 
    player1name: string;
    room_id: string; 
    date: string
}
 
export class LeaderboardLayer extends Phaser.GameObjects.Container {

    private leaderboard: LeaderboardData[] = [];
    private leaderboardURL = 'https://guineadig.parlette.org/leaderboard.json';

    constructor(scene: Phaser.Scene) {
        super(scene);        
    }

    async create() {
        await fetch(this.leaderboardURL)
            .then(response => response.text())
            .then(text => text.split('\n').forEach(obj => 
                {
                    if (obj) {
                        this.leaderboard.push(JSON.parse(obj))
                    }
                }));

        let fontStyle = {
            fontFamily: 'InkFree',
            fontSize: '22px',
            color: '#f2dd6e'
        };

        if (this.leaderboard) {
            let leaderboardX = [300, 400, 500, 600];

            this.scene.add.text(leaderboardX[0], 200, "Rank", fontStyle);
            this.scene.add.text(leaderboardX[1], 200, "Time", fontStyle);
            this.scene.add.text(leaderboardX[2], 200, "Room Id", fontStyle);
            this.scene.add.text(leaderboardX[3], 200, "Date", fontStyle);

            this.leaderboard.sort((a ,b) => a.time - b.time);
            let entryHeight = 230;
            for (let i = 0; i < 10; i++) {
                this.scene.add.text(leaderboardX[0], entryHeight, i.toString(), fontStyle);
                this.scene.add.text(leaderboardX[1], entryHeight, new String(this.leaderboard[i].time).slice(0,5), fontStyle);
                this.scene.add.text(leaderboardX[2], entryHeight, this.leaderboard[i].room_id, fontStyle);
                this.scene.add.text(leaderboardX[3], entryHeight, this.leaderboard[i].date, fontStyle);
                    entryHeight += 30;
            }
        } else {
            this.scene.add.text(GameManager.WINDOW_WIDTH/2 - 150, 300, 
                `Could not load leaderboard!`, fontStyle);
        }
    }

    update() {
    }

}