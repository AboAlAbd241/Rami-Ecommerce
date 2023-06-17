import { Ng2ImgMaxService } from 'ng2-img-max';
import { Component, OnInit, Output } from '@angular/core';
import { EventEmitter } from '@angular/core';

@Component({
  selector: 'app-upload-images',
  templateUrl: './upload-images.component.html',
  styleUrls: ['./upload-images.component.css']
})
export class UploadImagesComponent implements OnInit {

  draggedImageIndex: number | null = null;
  selectedImages: {name: string, url: String, file: any}[] = [];
  supportedImageFlag = false;
  @Output() imagesEvent = new EventEmitter<{name: string, url: String, file: any}[]>();



  constructor(private ng2ImgMax: Ng2ImgMaxService) { }

  ngOnInit(): void {
  }

  sendImages() {
    this.imagesEvent.emit(this.selectedImages);
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
            reader.onload = () => {
              this.selectedImages.push({
                name: file.name,
                url: reader.result as string,
                file: new File([result], file.name),
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
    this.addImages(files);
  }
  onDragOverSelectedImage(event: any, index: number) {
    if (this.draggedImageIndex !== null && this.draggedImageIndex !== index) {
      event.preventDefault();
      event.dataTransfer.dropEffect = 'move';
    }
  }

  onDropSelectedImage(event: any, index: number) {
    if (this.draggedImageIndex !== null && this.draggedImageIndex !== index) {
      event.preventDefault();
      // Swap the dragged image with the target image
      const draggedImage = this.selectedImages[this.draggedImageIndex];
      this.selectedImages[this.draggedImageIndex] = this.selectedImages[index];
      this.selectedImages[index] = draggedImage;
      this.sendImages();
    }
    this.draggedImageIndex = null;
  }

  addImages(files: FileList) {
    // Iterate through the selected files and add them to the selectedImages array
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const reader = new FileReader();
      reader.onload = () => {
        this.selectedImages.push({
          name: file.name,
          url: reader.result as string,
          file: file
        });

        this.sendImages();
      }
      reader.readAsDataURL(file);
    }
  }

  setMainImage(index: number) {
    // Swap the selected image with the first image in the array
    const mainImage = this.selectedImages[0];
    this.selectedImages[0] = this.selectedImages[index];
    this.selectedImages[index] = mainImage;
    this.sendImages();
  }

  onDragStart(event: any, index: number) {
    this.draggedImageIndex = index;
  }



  onDragEnd(event: any) {
    this.draggedImageIndex = null;
  }

  onDeleteImage(index: number) {
    this.selectedImages.splice(index, 1);
    this.sendImages();
  }

  resetImage(){
    this.selectedImages = [];
  }
}
