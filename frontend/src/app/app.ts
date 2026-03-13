import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Auth } from './services/auth';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit {
  isLoggedIn: boolean = false;

  constructor(private authService: Auth) { }

  ngOnInit(): void {
    this.authService.isLoggedIn$.subscribe(value => {
      this.isLoggedIn = value;
    });
  }
}