import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RetosService } from '../../services/retos.service'; // Subimos dos niveles
import { ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-retos',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './retos.html',
  styleUrl: './retos.css'
})
export class Retos implements OnInit {
  listaDeRetos: any[] = [];

  constructor(private retosService: RetosService) {}

  ngOnInit(): void {
    this.retosService.getRetos().subscribe({
      next: (data) => {
        this.listaDeRetos = data;
        console.log('Retos cargados: ', data);
      },
      error: (err) => console.error('Fallo al conectar con Laravel', err)
    });
  }
}