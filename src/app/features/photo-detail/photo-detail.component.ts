import { NgOptimizedImage } from '@angular/common';
import { Component, inject, input, OnInit } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';

import { LoaderComponent } from '@shared/ui/loader/loader.component';

import { PhotoDetailStore } from './photo-detail.store';

@Component({
  selector: 'app-photo-detail',
  templateUrl: './photo-detail.component.html',
  styleUrl: './photo-detail.component.scss',
  imports: [NgOptimizedImage, MatButton, MatIcon, LoaderComponent],
  providers: [PhotoDetailStore]
})
export class PhotoDetailComponent implements OnInit {
  readonly id = input.required<string>();

  protected readonly store = inject(PhotoDetailStore);

  ngOnInit(): void {
    this.store.load(this.id());
  }
}