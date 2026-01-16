import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ProjectService } from '../../services/project.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-devis',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './devis.component.html',
  styleUrls: ['./devis.component.css']
})
export class DevisComponent implements OnInit {
  currentStep = 1;
  showSuccess = false;
  isLoading = false;
  errorMessage = '';
  successMessage = '';

  projectData = {
    clientName: '',
    clientEmail: '',
    clientPhone: '',
    projectAddress: '',
    projectType: 'construction',
    surface: 0,
    budget: '',
    tasks: [] as string[],
    additionalTasks: '',
    deadline: '',
    style: '',
    description: ''
  };

  constructor(
    public router: Router, // ← PUBLIC pour le template
    private projectService: ProjectService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    // Vérifier la connexion
    if (!this.authService.isLoggedIn()) {
      this.errorMessage = 'Veuillez vous connecter pour continuer';
      setTimeout(() => this.router.navigate(['/connexion']), 2000);
      return;
    }

    // Pré-remplir les données
    const user = this.authService.getCurrentUser();
    if (user) {
      this.projectData.clientName = `${user.prenom} ${user.nom}`.trim();
      this.projectData.clientEmail = user.email;
      this.projectData.clientPhone = user.telephone || '';
    }
  }

  nextStep(): void {
    if (this.validateCurrentStep()) {
      this.currentStep++;
    }
  }

  prevStep(): void {
    this.currentStep--;
  }

  validateCurrentStep(): boolean {
    this.errorMessage = '';
    
    if (this.currentStep === 1) {
      if (!this.projectData.clientName.trim()) {
        this.errorMessage = 'Nom requis';
        return false;
      }
      if (!this.projectData.clientEmail.trim()) {
        this.errorMessage = 'Email requis';
        return false;
      }
      if (!this.projectData.projectAddress.trim()) {
        this.errorMessage = 'Adresse requise';
        return false;
      }
    }
    
    if (this.currentStep === 2) {
      if (!this.projectData.projectType) {
        this.errorMessage = 'Type de projet requis';
        return false;
      }
      if (!this.projectData.surface || this.projectData.surface <= 0) {
        this.errorMessage = 'Surface valide requise';
        return false;
      }
    }
    
    return true;
  }

  submitForm(): void {
    if (!this.validateCurrentStep()) return;
    
    this.isLoading = true;
    this.errorMessage = '';
    
    console.log('🟡 Envoi projet:', this.projectData);
    
    this.projectService.createProject(this.projectData).subscribe({
      next: (response: any) => {
        console.log('🟢 Réponse:', response);
        this.isLoading = false;
        
        if (response.success) {
          this.successMessage = 'Projet créé avec succès !';
          this.showSuccess = true;
          
          setTimeout(() => {
            this.router.navigate(['/']);
          }, 3000);
        } else {
          this.errorMessage = response.message || 'Erreur';
        }
      },
      error: (error: any) => {
        console.error('🔴 Erreur:', error);
        this.isLoading = false;
        
        if (error.status === 401) {
          this.errorMessage = 'Session expirée. Veuillez vous reconnecter.';
          this.authService.logout();
          setTimeout(() => this.router.navigate(['/connexion']), 2000);
        } else if (error.status === 0) {
          this.errorMessage = 'Serveur indisponible';
        } else {
          this.errorMessage = error.error?.message || 'Erreur serveur';
        }
      }
    });
  }
}