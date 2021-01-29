import { Response } from './Socket';
import { Pig } from './objects/Pig'

export class PigManager {

    private mainPig: Pig;

    /**
     * Sets the main pig. This is the pig controlled by the user.
     */
    setMainPig(pig: Pig) {
        this.mainPig = pig;
    }

    /**
     * Handles the move response by moving the other Pigs.
     */
    handleMoveResponse(response: Response) {

    }
}
