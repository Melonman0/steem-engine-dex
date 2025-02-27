import { Router } from 'aurelia-router';
import { ToastMessage } from './../services/toast-service';
import { I18N } from 'aurelia-i18n';
import { Store, dispatchify } from 'aurelia-store';
import { SteemEngine } from 'services/steem-engine';
import { DialogController } from 'aurelia-dialog';
import { autoinject } from 'aurelia-framework';
import { State } from 'store/state';
import { pluck } from 'rxjs/operators';
import { Subscription } from 'rxjs';
import { environment } from 'environment';
import { ToastService } from 'services/toast-service';
import { login } from 'store/actions';
import { SteemKeychain } from 'services/steem-keychain';

import styles from './signin.module.css';

@autoinject()
export class SigninModal {
    private styles = styles;
    private environment = environment;
    private subscription: Subscription;
    private loading = false;
    private useActiveKey = false;
    private username;
    private privateKey;

    constructor(private controller: DialogController, private se: SteemEngine, private keychain: SteemKeychain, 
        private i18n: I18N, private router: Router, private toast: ToastService) {
        this.controller.settings.lock = false;
        this.controller.settings.centerHorizontalOnly = true;
    }

    async keychainSignIn() {
        try {
            this.loading = true;

            const { username } = await this.se.login(this.username.trim().toLowerCase());

            if (username) {
                const toast = new ToastMessage();
        
                toast.message = this.i18n.tr('signinSuccess', { ns: 'notifications' });
    
                toast.overrideOptions.onClosing = () => {
                    this.controller.close(true);
                    this.loading = false;
                    this.router.navigateToRoute('home');
                }
    
                this.toast.success(toast);
    
                await dispatchify(login)(username);
            }
        } catch (e) {
            this.loading = false;
        }
    }

    async keySignIn() {
        try {
            this.loading = true;

            const { username } = await this.se.login(this.username.trim().toLowerCase(), this.privateKey.trim());
        
            if (username) {
                const toast = new ToastMessage();
        
                toast.message = this.i18n.tr('signinSuccess', { ns: 'notifications' });
    
                toast.overrideOptions.onClosing = () => {
                    this.controller.close(true);
                    this.router.navigateToRoute('home');
                }
    
                this.toast.success(toast);
    
                await dispatchify(login)(username);

                this.loading = false;
            }
        } catch (e) {
            this.loading = false;
        }
    }
}
