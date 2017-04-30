import {Item, Weight} from './datatypes'

export class Codex extends Item {
    weight() {
        return Weight.medium;
    }

    name() {
        return 'codex';
    }

    pre_gestalt() {
        return 'something thick and aged';
    }

    post_gestalt() {
        return 'a thick, rotten codex with strange markings on the front';
    }
}

export class CityKey extends Item {
    weight() {
        return Weight.light;
    }

    name() {
        return 'Key to the City';
    }

    pre_gestalt() {
        return 'something glistening and golden';
    }

    post_gestalt() {
        return 'a large, heavy golden key';
    }

    article() {
        return 'the';
    }
}

export class Pinecone extends Item {
    weight() {
        return Weight.very_light;
    }

    name() {
        return 'pinecone';
    }

    pre_gestalt() {
        return 'something small, brown and flaky';
    }

    post_gestalt() {
        return 'a small, brown pinecone that smells of the outdoors';
    }
}