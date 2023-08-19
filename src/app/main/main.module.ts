import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ContainerComponent } from './components/container/container.component';
// Material Imports
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

@NgModule({
  declarations: [ContainerComponent],
  imports: [CommonModule, MatButtonModule, MatFormFieldModule, MatInputModule],
  exports: [ContainerComponent],
})
export class MainModule {}
