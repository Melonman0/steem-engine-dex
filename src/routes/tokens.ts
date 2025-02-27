import { State } from './../store/state';
import { SteemEngine } from 'services/steem-engine';
import { autoinject, TaskQueue } from 'aurelia-framework';

import firebase from 'firebase/app';
import { connectTo, dispatchify } from 'aurelia-store';
import { loadTokensList, getCurrentFirebaseUser } from 'store/actions';

@autoinject()
@connectTo()
export class Tokens {
    private tokenTable: HTMLTableElement;
    private state: State;

    constructor(private se: SteemEngine, private taskQueue: TaskQueue) {

    }

    async canActivate() {
        await dispatchify(loadTokensList)();
    }

    async activate() {
        await dispatchify(getCurrentFirebaseUser)();
    }

    attached() {
        // @ts-ignore
        $(this.tokenTable).DataTable({
            bInfo: false,
            paging: false,
            searching: false
        });
    }

    favouriteToken(token) {
        this.taskQueue.queueTask(() => {
            token.isFavourite = !token.isFavourite;

            this.state.tokens.forEach(t => {
                if (t.isFavourite && !this.state.firebaseUser.favourites.includes(t.symbol)) {
                    this.state.firebaseUser.favourites.push(t.symbol);
                } else if (!t.isFavourite && this.state.firebaseUser.favourites.includes(t.symbol)) {
                    this.state.firebaseUser.favourites.splice(this.state.firebaseUser.favourites.indexOf(t.symbol), 1);
                }
            });

            const userRef = firebase.firestore().collection('users').doc(this.se.getUser());

            userRef.set(this.state.firebaseUser, {
                merge: true
            });
        });
    }
}
