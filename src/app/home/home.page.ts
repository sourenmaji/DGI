import { Component } from '@angular/core';
import { Platform, ActionSheetController, ToastController } from '@ionic/angular';
import { File } from '@ionic-native/file/ngx';
import {FilePath} from '@ionic-native/file-path/ngx';
import { FileTransfer } from '@ionic-native/file-transfer/ngx';
import { Camera } from '@ionic-native/camera/ngx';
import { async } from 'q';

declare var Zeep: any;

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  providers: [FilePath, FileTransfer, File]
})

export class HomePage {
  fileName:string []=[];
  folderName: any;
  lastImage: string = null;
  constructor(public platform: Platform, private file: File, public camera: Camera, public actionSheetCtrl: ActionSheetController,
     private filePath: FilePath, public toastCtrl: ToastController) {
  //      console.log("hi");
  //     this.platform.ready().then(() => {
        
  //       console.log("in");
  //       var source    = this.file.applicationDirectory,
  //           zip       = this.file.cacheDirectory + 'source.zip',
  //           extracted = this.file.cacheDirectory + 'extracted';
  //       alert(source);
  //       alert(zip);
  //       alert(extracted);
  //       console.log('source    : ' + source   );
  //       console.log('zip       : ' + zip      );
  //       console.log('extracted : ' + extracted);
        
  //       console.log('zipping ...');
        
  //   (<any>window).plugins.zip({
  //           from : source,
  //           to   : zip
  //       }).then(function() {
            
  //           console.log('zip success!');
  //           console.log('unzipping ...');
            
  //       }, function(e) {
  //           console.log('zip error: ', e);
  //       });
        
    

  // })







    this.platform.ready().then(() => {
      console.log(this.file.externalRootDirectory +'DJI');
      this.file.listDir(this.file.externalRootDirectory,'DJI').then((result)=>{
       // console.log(result);
      //  alert(JSON.stringify(result));
  /*result will have an array of file objects with 
  file details or if its a directory*/
  for(let file of result){
   if(file.isDirectory == true && file.name !='.' && file.name !='..'){
   // Code if its a folder
   this.folderName = file.name;
   console.log("folder=="+this.folderName);
   this.fun(this.folderName);
   }
  else if(file.isFile == true){
   // Code if its a file
   this.fileName.push(file.name);//=this.fileName+file.name; // File name
   console.log(this.fileName);
  //  let path=file.path // File path
    //  file.getMetadata(function (metadata) {
    //    alert(JSON.stringify(metadata));
    //  let size=metadata.size; // Get file size
    //  alert(size);
    //  })
  }
   }
  })
  })


  }


  fun(folderName){
    let fl = folderName;
    console.log(fl);
    //alert(this.file.externalRootDirectory +'DJI/dji.pilot/'+fl)
    this.file.listDir(this.file.externalRootDirectory,'DJI/'+fl+'/').then((result)=>{
      // console.log(result);
      console.log("2nd function=="+JSON.stringify(result));
  /*result will have an array of file objects with 
  file details or if its a directory*/
  for(let file of result){
  if(file.isDirectory == true && file.name !='.' && file.name !='..'){
  // Code if its a folder
  this.folderName = file.name;
  console.log("2nd folder == "+this.folderName);
  this.fun(folderName+'/'+this.folderName);
  }else if(file.isFile == true){
  // Code if its a file
  this.fileName.push(file.name); // File name
  console.log(this.fileName);
  //  let path=file.path // File path
    // file.getMetadata(function (metadata) {
    //   alert(JSON.stringify(metadata));
    // let size=metadata.size; // Get file size
    // alert(size);
    // })
  }
  }
  })
  }
  async presentActionSheet() {
    let actionSheet =await this.actionSheetCtrl.create({
      header: 'Select Image Source',
      buttons: [

        {
          text: 'Load from Library',
          handler: () => {
            this.takePicture(this.camera.PictureSourceType.PHOTOLIBRARY);
          }
        },
        {
          text: 'Use Camera',
          handler: () => {
            this.takePicture(this.camera.PictureSourceType.CAMERA);
          }
        },
        {
          text: 'Cancel',
          role: 'cancel'
        }
      ]
    });
    actionSheet.present();
  }

  public takePicture(sourceType) {
    // Create options for the Camera Dialog
    var options = {
      quality: 60,
      sourceType: sourceType,
      saveToPhotoAlbum: false,
      correctOrientation: true
    };

    // Get the data of an image
    
    this.camera.getPicture(options).then((imagePath) => {
      alert("ImagePath == "+imagePath);
      // Special handling for Android library
      if (this.platform.is('android') && sourceType === this.camera.PictureSourceType.PHOTOLIBRARY) {
        this.filePath.resolveNativePath(imagePath)
          .then(filePath => {
            alert("filepath == "+filePath);
            let correctPath = filePath.substr(0, filePath.lastIndexOf('/') + 1);
            let currentName = imagePath.substring(imagePath.lastIndexOf('/') + 1, imagePath.lastIndexOf('?'));
            alert("corect== "+correctPath);
            alert("currentName== "+currentName);
            this.copyFileToLocalDir(correctPath, currentName, this.createFileName());
          });
      } else {
        var currentName = imagePath.substr(imagePath.lastIndexOf('/') + 1);
        var correctPath = imagePath.substr(0, imagePath.lastIndexOf('/') + 1);
        this.copyFileToLocalDir(correctPath, currentName, this.createFileName());
      }
    }, (err) => {
      this.presentToast('Error while selecting image.');
    });
  }


  private createFileName() {
    var d = new Date(),
    n = d.getTime(),
    newFileName =  n + ".jpg";
    return newFileName;
  }

  // Copy the image to a local folder
  private copyFileToLocalDir(namePath, currentName, newFileName) {
    this.file.copyFile(namePath, currentName, cordova.file.dataDirectory, newFileName).then(success => {
      this.lastImage = newFileName;
      alert(this.lastImage);
      //alert("final image=="+cordova.file.dataDirectory + this.lastImage);
    }, error => {
      this.presentToast('Error while storing file.');
    });
  }

  async presentToast(text) {
    const toast = await this.toastCtrl.create({
      message: text,
      duration: 3000,
      position: 'top'
    });
    toast.present();
  }

  // Always get the accurate path to your apps folder
  public pathForImage(img) {
    if (img === null) {
      return '';
    } else {
      return cordova.file.dataDirectory + img;
    }
  }


}
