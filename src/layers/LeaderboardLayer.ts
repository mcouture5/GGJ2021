export interface LeaderboardData {
    time: number; 
    player0name: string; 
    player1name: string;
    room_id: string; 
    date: string
}
 
export class LeaderboardLayer extends Phaser.GameObjects.Container {

    private leaderboard: LeaderboardData[];

    constructor(scene: Phaser.Scene) {
        super(scene);

        let leaderboardURL = 'https://guineadig.parlette.org/leaderboard.json';

        fetch(leaderboardURL).then(response => response.json())
                             .then(json => this.leaderboard = json);
    }

    create() {
        let fontStyle = {
            fontFamily: 'InkFree',
            fontSize: '22px',
            color: '#f2dd6e'
        };

        let leaderboardX = [300, 400, 500, 600];

        this.scene.add.text(leaderboardX[0], 200, "Rank", fontStyle);
        this.scene.add.text(leaderboardX[1], 200, "Completion Time", fontStyle);
        this.scene.add.text(leaderboardX[2], 200, "Room Id", fontStyle);
        this.scene.add.text(leaderboardX[3], 200, "Date", fontStyle);

        this.leaderboard.sort((a ,b) => a.time - b.time);
        let entryHeight = 210;
        for (let i = 0; i < this.leaderboard.length; i++) {
            this.scene.add.text(leaderboardX[0], entryHeight, i.toString(), fontStyle);
            this.scene.add.text(leaderboardX[1], entryHeight, new String(this.leaderboard[i].time).slice(0,5), fontStyle);
            this.scene.add.text(leaderboardX[2], entryHeight, this.leaderboard[i].room_id, fontStyle);
            this.scene.add.text(leaderboardX[3], entryHeight, this.leaderboard[i].date, fontStyle);
                entryHeight += 10;
        }

    }

    update() {
    }

}