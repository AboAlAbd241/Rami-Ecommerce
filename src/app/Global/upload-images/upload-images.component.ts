import { Ng2ImgMaxService } from 'ng2-img-max';
import { Component, Input, OnInit, Output } from '@angular/core';
import { EventEmitter } from '@angular/core';

@Component({
  selector: 'app-upload-images',
  templateUrl: './upload-images.component.html',
  styleUrls: ['./upload-images.component.css']
})
export class UploadImagesComponent implements OnInit {

  draggedImageIndex: number | null = null;
  // selectedImages: {name: string, url: String, file: any}[] = [];
  supportedImageFlag = false;
  @Output() imagesEvent = new EventEmitter<{id: string, imagePath: String, priority: any}[]>();
  @Output() deletedImages = new EventEmitter<{id: string, imagePath: String, priority: any}[]>();
  @Input() imagesList = [];
	dragIndex: number | null = null;
	deletedImagesList = [];



  constructor(private ng2ImgMax: Ng2ImgMaxService) { }

  ngOnInit(): void {

    this.sortImages();
  }

  sendImages() {
    // this.imagesEvent.emit(this.selectedImages);
    this.imagesEvent.emit(this.imagesList);
  }

  sendDeletedImages(){
    this.deletedImages.emit(this.deletedImagesList);
  }

  onImageUpload(event: any) {
    const files: FileList = event.target.files;
    const allowedExtensions = ['jpg', 'jpeg', 'png'];

    // Iterate through the selected files
    for (let i = 0; i < files.length; i++) {
      const file: File = files[i];
      const extension: string = file.name.split('.').pop().toLowerCase();
      const isValidExtension: boolean = allowedExtensions.includes(extension);

      if (isValidExtension) {
        this.ng2ImgMax.compressImage(file, 0.7).subscribe(
          result => {
            const reader: FileReader = new FileReader();
            reader.onload = (e: any) => {
              // this.selectedImages.push({
              //   name: file.name,
              //   url: reader.result as string,
              //   file: new File([result], file.name),
              // });       
                this.imagesList.push({
                id: '',
                imagePath: e.target.result,
			          priority: this.imagesList.length
              });

              this.sendImages();
            };
            reader.readAsDataURL(result);
          },
          error => {
            console.error('Error compressing image:', error);
          }
        );
      }else{
        this.supportedImageFlag = true;
      }
    }

    // Clear the file input element
    event.target.value = '';
  }


  onDragOver(event: any) {
    event.preventDefault();
    event.stopPropagation();
    event.dataTransfer.dropEffect = 'copy';
  }

  onDragLeave(event: any) {
    event.preventDefault();
    event.stopPropagation();
  }

  onDrop(event: any) {
    event.preventDefault();
    event.stopPropagation();
    const files = event.dataTransfer.files;
    this.addImage(files);
  }

  resetImage(){
    // this.selectedImages = [];
    this.imagesList = [];
  }





  dragStart(event: any, index: number) {
		this.dragIndex = index;
		event.dataTransfer.effectAllowed = 'move';
		event.dataTransfer.setData('text/plain', index.toString());
	  }
	
	  dragOver(event: any) {
		event.preventDefault();
		event.dataTransfer.dropEffect = 'move';
	  }
	
	  drop(event: any, index: number) {
		event.preventDefault();
		const fromIndex = this.dragIndex;
		const toIndex = index;
		if (fromIndex !== toIndex) {
		  const draggedImage = this.imagesList[fromIndex];
		  this.imagesList.splice(fromIndex, 1);
		  this.imagesList.splice(toIndex, 0, draggedImage);
		  this.updateImagePriorities();
		}
	  }
	
	  updateImagePriorities() {
		this.imagesList.forEach((image, index) => {
		  image.priority = index;
		});
	  }
	
	  deleteImage(index: number) {
		let img : any = this.imagesList.splice(index, 1);

		if(img[0].id && img[0].id != ''){
			this.deletedImagesList.push(img[0]);
		}
		this.updateImagePriorities();
    this.sendImages();
    this.sendDeletedImages();
	  }
	
	  addImage(event: any) {
		const files = event.target.files;
		for (let i = 0; i < files.length; i++) {
		  const file = files[i];
		  const reader = new FileReader();
		  reader.onload = (e: any) => {
			const image = {
			  id: '',
			  imagePath: e.target.result,
			  priority: this.imagesList.length
			};
			this.imagesList.push(image);
      this.sendImages();
		  };
		  reader.readAsDataURL(file);
		}
	  }

    sortImages(){
      if(this.imagesList && this.imagesList.length > 0){
        this.imagesList = this.imagesList.sort((a, b) => a.priority - b.priority)
      }
    }
}
