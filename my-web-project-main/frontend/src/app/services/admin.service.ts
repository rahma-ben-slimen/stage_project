import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private apiUrl = 'http://localhost:5000/api/admin';

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

  // Récupérer tous les clients
  getAllClients(): Observable<any> {
    return this.http.get(`${this.apiUrl}/clients`, { 
      headers: this.getHeaders() 
    });
  }

  // Supprimer un client
  deleteClient(clientId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/clients/${clientId}`, { 
      headers: this.getHeaders() 
    });
  }

  // Supprimer un projet
  deleteProject(projectId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/projects/${projectId}`, { 
      headers: this.getHeaders() 
    });
  }
}