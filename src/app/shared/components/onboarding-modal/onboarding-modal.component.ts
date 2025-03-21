import { Component, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserPreferencesStore } from '../../../core/stores/user-preferences.store';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-onboarding-modal',
  templateUrl: './onboarding-modal.component.html',
  styleUrls: ['./onboarding-modal.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule]
})
export class OnboardingModalComponent implements OnInit, AfterViewInit {
  @ViewChild('privacyPolicyContent') privacyPolicyContent!: ElementRef;
  
  isVisible = false;
  firstName = '';
  lastName = '';
  geolocationEnabled = false;
  notificationsEnabled = false;
  privacyPolicyAccepted = true;
  formSubmitted = false;
  showPrivacyPolicy = false;
  hasReadPrivacyPolicy = false;
  
  // Mode débogage
  debugMode = true;
  
  constructor(
    private userPreferencesStore: UserPreferencesStore,
    private translateService: TranslateService
  ) {}

  ngOnInit(): void {
    // Vérifier si l'onboarding est déjà complété via le service
    if (!this.userPreferencesStore.isOnboardingCompleted()) {
      this.isVisible = true;
    }
    
    // Note: Pas besoin d'initialiser les traductions ici car c'est déjà fait dans AppComponent
  }
  
  ngAfterViewInit(): void {
    // Pour s'assurer que le ViewChild est correctement initialisé
    if (this.debugMode) {
      console.log('Privacy policy content element:', this.privacyPolicyContent);
    }
  }

  savePreferences(): void {
    this.formSubmitted = true;
    
    // Validate form
    if (!this.firstName || !this.lastName) {
      return;
    }
    
    this.userPreferencesStore.updatePreferences({
      firstName: this.firstName,
      lastName: this.lastName,
      geolocationEnabled: this.geolocationEnabled,
      notificationsEnabled: this.notificationsEnabled,
      privacyPolicyAccepted: true,
      onboardingCompleted: true
    });
    
    this.closeModal();
  }

  closeModal(): void {
    this.isVisible = false;
  }

  requestGeolocationPermission(): void {
    if (this.geolocationEnabled && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        () => {
          if (this.debugMode) console.log('Geolocation permission granted');
        },
        () => {
          if (this.debugMode) console.log('Geolocation permission denied');
          this.geolocationEnabled = false;
        }
      );
    }
  }

  requestNotificationPermission(): void {
    if (this.notificationsEnabled && 'Notification' in window) {
      Notification.requestPermission().then(permission => {
        if (permission !== 'granted') {
          this.notificationsEnabled = false;
        }
      });
    }
  }

  showPrivacyPolicyContent(): void {
    this.showPrivacyPolicy = true;
    this.hasReadPrivacyPolicy = false;
    
    // Reset scroll position when showing privacy policy
    setTimeout(() => {
      if (this.privacyPolicyContent) {
        this.privacyPolicyContent.nativeElement.scrollTop = 0;
        if (this.debugMode) console.log('Reset scroll position');
      }
    });
  }

  hidePrivacyPolicy(): void {
    if (this.debugMode) console.log('hidePrivacyPolicy called');
    this.showPrivacyPolicy = false;
  }

  onPrivacyPolicyScroll(event: Event): void {
    if (!this.privacyPolicyContent) {
      if (this.debugMode) console.error('Privacy policy content element not found');
      return;
    }
    
    const element = event.target as HTMLElement;
    const scrollPosition = element.scrollTop + element.clientHeight;
    const scrollHeight = element.scrollHeight;
    
    if (this.debugMode) {
      console.log('Scroll position:', scrollPosition);
      console.log('Scroll height:', scrollHeight);
      console.log('Scroll percentage:', (scrollPosition / scrollHeight) * 100);
    }
    
    // Consider the content as read when the user has scrolled to 80% of the content
    if (scrollPosition >= scrollHeight * 0.8) {
      this.hasReadPrivacyPolicy = true;
      if (this.debugMode) console.log('Privacy policy has been read:', this.hasReadPrivacyPolicy);
    }
  }
  
  // Méthode pour calculer le pourcentage de défilement
  getScrollPercentage(): number {
    if (!this.privacyPolicyContent || !this.privacyPolicyContent.nativeElement) {
      return 0;
    }
    
    const element = this.privacyPolicyContent.nativeElement;
    if (element.scrollHeight <= element.clientHeight) {
      return 100; // Si le contenu est plus petit que le conteneur, on considère qu'il est entièrement visible
    }
    
    const scrollPosition = element.scrollTop;
    const maxScroll = element.scrollHeight - element.clientHeight;
    return Math.min(100, Math.max(0, (scrollPosition / maxScroll) * 100));
  }
  
  // Méthode pour obtenir les traductions
  getTranslation(key: string): string {
    return this.translateService.instant(key) || key;
  }
  
  // Méthode pour forcer l'activation du bouton retour (pour le débogage)
  forceEnableBackButton(): void {
    this.hasReadPrivacyPolicy = true;
  }
} 