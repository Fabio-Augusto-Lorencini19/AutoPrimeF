import { Directive, EmbeddedViewRef, Input, TemplateRef, ViewContainerRef, effect, inject } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';
import { Papel } from '../../core/models/user.model';

@Directive({
  selector: '[appHasRole]',
  standalone: true
})
export class HasRoleDirective {
  private auth = inject(AuthService);
  private templateRef = inject(TemplateRef<unknown>);
  private viewContainer = inject(ViewContainerRef);
  private view: EmbeddedViewRef<unknown> | null = null;

  @Input() set appHasRole(papeisPermitidos: Papel[]) {
    this.papeis = papeisPermitidos;
  }

  private papeis: Papel[] = [];

  constructor() {
    effect(() => {
      const podeVer = this.auth.temPapel(this.papeis);

      if (podeVer && !this.view) {
        this.view = this.viewContainer.createEmbeddedView(this.templateRef);
      } else if (!podeVer && this.view) {
        this.viewContainer.clear();
        this.view = null;
      }
    });
  }
}
