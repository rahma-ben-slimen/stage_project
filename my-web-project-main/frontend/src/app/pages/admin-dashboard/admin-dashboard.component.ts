import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ProjectService } from '../../services/project.service';
import { AuthService } from '../../services/auth.service';
import { AdminService } from '../../services/admin.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css']
})
export class AdminDashboardComponent implements OnInit {
  projects: any[] = [];
  recentProjects: any[] = [];
  clients: any[] = [];
  problems: any[] = [];
  isLoading = false;
  currentDate = new Date();
  
  stats = {
    activeProjects: 0,
    urgentProblems: 0,
    totalClients: 0,
    monthlyRevenue: 425000
  };

  constructor(
    public router: Router,
    private projectService: ProjectService,
    private authService: AuthService,
    private adminService: AdminService
  ) {}

  ngOnInit(): void {
    if (!this.authService.isAdmin()) {
      this.router.navigate(['/']);
      return;
    }
    
    this.loadData();
  }

  refreshData(): void {
    this.loadData();
  }

  loadData(): void {
    this.loadProjects();
    this.loadClients();
    this.loadRecentProjects();
    this.loadProblems();
  }

  loadProjects(): void {
    this.isLoading = true;
    
    this.projectService.getAllProjects().subscribe({
      next: (response: any) => {
        this.isLoading = false;
        if (response.success) {
          this.projects = response.projects;
          this.stats.activeProjects = response.count || response.projects.length;
        }
      },
      error: (error) => {
        this.isLoading = false;
      }
    });
  }

  loadClients(): void {
    this.adminService.getAllClients().subscribe({
      next: (response: any) => {
        if (response.success) {
          this.clients = response.clients;
          this.stats.totalClients = response.clients.length;
        }
      },
      error: (error) => {
        console.error('Erreur chargement clients:', error);
      }
    });
  }

  loadRecentProjects(): void {
    this.projectService.getRecentProjects().subscribe({
      next: (response: any) => {
        if (response.success) {
          this.recentProjects = response.projects.slice(0, 3);
        }
      },
      error: (error) => {
        console.error('Erreur projets récents:', error);
      }
    });
  }

  loadProblems(): void {
    this.problems = [
      {
        id: 1,
        clientName: 'Mohamed Ali',
        description: 'Retard dans la livraison des matériaux de construction',
        priority: 'Haute',
        date: '15/01/2024',
        status: 'Nouveau'
      },
      {
        id: 2,
        clientName: 'Sarah Ben',
        description: 'Problème de plomberie dans la salle de bain principale',
        priority: 'Moyenne',
        date: '14/01/2024',
        status: 'En cours'
      }
    ];
    
    this.stats.urgentProblems = this.problems.filter(p => p.priority === 'Haute').length;
  }

  getStatusClass(status: string): string {
    const classMap: { [key: string]: string } = {
      'Nouveau': 'status-new',
      'En cours': 'status-in-progress',
      'Résolu': 'status-resolved',
      'Terminé': 'status-resolved',
      'pending': 'status-new',
      'in_progress': 'status-in-progress',
      'resolved': 'status-resolved',
      'completed': 'status-resolved'
    };
    return classMap[status] || 'status-new';
  }

  getPriorityClass(priority: string): string {
    const classMap: { [key: string]: string } = {
      'Haute': 'priority-high',
      'Moyenne': 'priority-medium',
      'Basse': 'priority-low'
    };
    return classMap[priority] || 'priority-medium';
  }

  // AJOUTER CETTE MÉTHODE
  viewProjectDetails(project: any): void {
    const message = `
      🏗️ DÉTAILS DU PROJET
      --------------------
      ID: #${project.id}
      Client: ${project.clientName}
      Email: ${project.clientEmail}
      Téléphone: ${project.clientPhone || 'Non fourni'}
      Adresse: ${project.projectAddress}
      Type: ${project.projectType}
      Surface: ${project.surface} m²
      Budget: ${project.budget || 'Non défini'}
      Statut: ${this.getStatusText(project.status)}
      Date création: ${new Date(project.createdAt).toLocaleDateString('fr-FR')}
      
      📝 Description:
      ${project.description || 'Aucune description'}
    `;
    alert(message);
  }

  // AJOUTER CETTE MÉTHODE (utilisée dans viewProjectDetails)
  private getStatusText(status: string): string {
    const statusMap: { [key: string]: string } = {
      'pending': 'En attente',
      'in_progress': 'En cours',
      'completed': 'Terminé',
      'resolved': 'Résolu',
      'problem': 'Problème'
    };
    return statusMap[status] || status;
  }

  // AJOUTER CETTE MÉTHODE (pour les problèmes)
  viewProblemDetails(problem: any): void {
    const message = `
      📋 DÉTAILS DU PROBLÈME
      ----------------------
      Client: ${problem.clientName}
      Description: ${problem.description}
      Priorité: ${problem.priority}
      Statut: ${problem.status}
      Date: ${problem.date}
      ID: ${problem.id}
    `;
    alert(message);
  }

  // AJOUTER CETTE MÉTHODE (pour les problèmes)
  resolveProblem(problem: any): void {
    const confirmation = confirm(
      `Êtes-vous sûr de vouloir marquer ce problème comme résolu ?\n\n` +
      `Client: ${problem.clientName}\n` +
      `Description: ${problem.description}`
    );
    
    if (confirmation) {
      this.problems = this.problems.filter(p => p.id !== problem.id);
      this.stats.urgentProblems = this.problems.filter(p => p.priority === 'Haute').length;
      alert(`✅ Problème #${problem.id} marqué comme résolu !`);
    }
  }

  deleteClient(client: any): void {
    const confirmation = confirm(
      `Êtes-vous sûr de vouloir supprimer ce client ?\n\n` +
      `Nom: ${client.prenom} ${client.nom}\n` +
      `Email: ${client.email}`
    );
    
    if (confirmation) {
      this.adminService.deleteClient(client.id).subscribe({
        next: (response: any) => {
          if (response.success) {
            alert(`✅ Client #${client.id} supprimé avec succès !`);
            this.clients = this.clients.filter(c => c.id !== client.id);
            this.stats.totalClients = this.clients.length;
          }
        },
        error: (error) => {
          alert('❌ Erreur lors de la suppression du client');
        }
      });
    }
  }

  deleteProject(project: any): void {
    const confirmation = confirm(
      `Êtes-vous sûr de vouloir supprimer ce projet ?\n\n` +
      `ID: #${project.id}\n` +
      `Client: ${project.clientName}`
    );
    
    if (confirmation) {
      this.adminService.deleteProject(project.id).subscribe({
        next: (response: any) => {
          if (response.success) {
            alert(`✅ Projet #${project.id} supprimé avec succès !`);
            this.projects = this.projects.filter(p => p.id !== project.id);
            this.stats.activeProjects = this.projects.length;
          }
        },
        error: (error) => {
          alert('❌ Erreur lors de la suppression du projet');
        }
      });
    }
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/']);
  }
}