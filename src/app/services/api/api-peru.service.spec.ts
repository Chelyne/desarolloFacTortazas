import { ComponentFixture, inject, TestBed  } from '@angular/core/testing';
import { AngularFirestore } from '@angular/fire/firestore';
import { DbDataService } from '../db-data.service';
import { StorageService } from '../storage.service';

import { ApiPeruService } from './api-peru.service';
// import 'jasmine-expect';

import { AngularFireModule } from '@angular/fire';
import { AngularFirestoreModule } from '@angular/fire/firestore';
import { environment } from 'src/environments/environment';



// describe('Service: My: TestBed', () => {
//     let service = ApiPeruService;


//     beforeEach(() => {
//         // TestBed.configureTestingModule({
//         //     providers: [ApiPeruService],
//         //     declarations: [DbDataService, StorageService]
//         // });

//         TestBed.configureTestingModule({
//             imports: [
//               AngularFireModule.initializeApp(environment.firebaseConfig),
//               AngularFirestoreModule
//             ],
//             declarations: [ ],
//             providers: [ ]
//           });
//           service = TestBed.inject(DbDataService, StorageService);
//     });

//     it('to be Created',  () => {
//         expect(service).toBeTruthy();
//     });


// });
