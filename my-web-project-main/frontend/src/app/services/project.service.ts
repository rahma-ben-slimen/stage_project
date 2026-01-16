import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class ProjectService {
  private apiUrl = 'http://localhost:5000/api/projects';

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  private getHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }

  // Créer un nouveau projet
  createProject(projectData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/create`, projectData, { 
      headers: this.getHeaders() 
    });
  }

  // Récupérer les projets de l'utilisateur connecté
  getUserProjects(): Observable<any> {
    return this.http.get(`${this.apiUrl}/my-projects`, { 
      headers: this.getHeaders() 
    });
  }

  // Récupérer tous les projets (admin seulement)
  getAllProjects(): Observable<any> {
    return this.http.get(`${this.apiUrl}/all`, { 
      headers: this.getHeaders() 
    });
  }

  // Récupérer les projets récents (public)
  getRecentProjects(): Observable<any> {
    return this.http.get(`${this.apiUrl}/recent`);
  }
}