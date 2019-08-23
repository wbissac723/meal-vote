import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';

import { DataStoreService } from 'src/app/shared/store/data-store.service';
import { AccountService } from 'src/app/components/services/account-service/account.service';
import { Router } from '@angular/router';
import { UserProfile, Tribe } from '../../models/user-profile.model';

import * as _ from 'lodash';

@Component({
  selector: 'app-tribe',
  templateUrl: './tribe.component.html',
  styleUrls: ['./tribe.component.scss']
})
export class TribeComponent implements OnInit {
  profile: UserProfile;
  tribeCreated: boolean;
  tribeCreatedMessage: string;

  form: FormGroup;

  constructor(
    private account: AccountService,
    private store: DataStoreService,
    private router: Router
  ) {
    this.store.profile.subscribe((profile: UserProfile) => {
      // Get profile from Local Storage when browser is refreshed
      if (!profile) {
        this.profile = store.getProfileFromLocalStorage();
        console.log('TribeComponent---> Retrieved profile from local storage, userName: ' + this.profile.userName);
      }
      this.profile = profile;
    });
  }

  get tribeName() {
    return this.form.get('tribeName');
  }

  ngOnInit() {
    this.form = new FormGroup({ tribeName: new FormControl('', Validators.required) });
  }

  createTribe() {
    const user = new UserProfile();
    user.userName = this.profile.userName;
    user.email = this.profile.email;
    user.tribe = new Array<Tribe>();
    user.tribe[0] = new Tribe();
    user.tribe[0].creator = this.profile.userName;
    user.tribe[0].name = this.tribeName.value;

    this.account.createUser(user)
      .subscribe(
        (response) => {

          const profile = new UserProfile();
          profile.email = response.user.email;
          profile.userName = response.user.userName;
          profile.tribe = response.user.tribe;

           // Update the Profile in DataStore
           this.store.updateProfile(profile);


          // TODO determine if this is necessary
          this.tribeCreated = true;
          this.tribeCreatedMessage = `You just created the ${this.tribeName.value} tribe.`;


          // Routes to user profile
            this.router.navigate(['/user/' + this.profile.userName]);
        }, (err) => {
          this.tribeCreated = false;
          console.log('Failed to store user in database.' + JSON.stringify(err, null, 2));
        });
  }
}
