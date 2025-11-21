import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { Model } from 'mongoose';

async function addDevopsEssentials() {
  const app = await NestFactory.createApplicationContext(AppModule);

  try {
    const langageModel = app.get<Model<any>>('LangageModel');

    console.log('🚀 AJOUT DES ESSENTIELS ET IMPORTANTS POUR LE DOMAINE DEVOPS\n');
    console.log('═══════════════════════════════════════════════════════════\n');

    const devopsItems = [
      // === ESSENTIELS ===
      // IaC (Infrastructure as Code)
      {
        name: 'Terraform',
        domain: ['devops', 'tools'],
        description: 'Outil IaC pour provisionner l\'infrastructure cloud',
        logoUrl: 'https://www.datocms-assets.com/2885/1620155116-brandhcterraformverticalcolor.svg',
        documentation: 'https://developer.hashicorp.com/terraform/docs',
        initialRelease: '2014',
        versions: []
      },
      // CI/CD
      {
        name: 'Jenkins',
        domain: ['devops', 'tools'],
        description: 'Serveur d\'automatisation open-source pour CI/CD',
        logoUrl: 'https://www.jenkins.io/images/logos/jenkins/jenkins.svg',
        documentation: 'https://www.jenkins.io/doc/',
        initialRelease: '2011',
        versions: []
      },
      {
        name: 'GitHub Actions',
        domain: ['devops', 'tools'],
        description: 'Plateforme CI/CD intégrée à GitHub',
        logoUrl: 'https://github.githubassets.com/images/modules/site/features/actions-icon-actions.svg',
        documentation: 'https://docs.github.com/en/actions',
        initialRelease: '2019',
        versions: []
      },
      {
        name: 'GitLab CI',
        domain: ['devops', 'tools'],
        description: 'CI/CD intégré à GitLab',
        logoUrl: 'https://about.gitlab.com/images/press/logo/svg/gitlab-logo-500.svg',
        documentation: 'https://docs.gitlab.com/ee/ci/',
        initialRelease: '2012',
        versions: []
      },
      // Monitoring
      {
        name: 'Prometheus',
        domain: ['devops', 'tools'],
        description: 'Système de monitoring et alerting open-source',
        logoUrl: 'https://prometheus.io/assets/prometheus_logo_grey.svg',
        documentation: 'https://prometheus.io/docs/',
        initialRelease: '2012',
        versions: []
      },
      {
        name: 'Grafana',
        domain: ['devops', 'tools'],
        description: 'Plateforme de visualisation et analytics',
        logoUrl: 'https://grafana.com/static/img/menu/grafana2.svg',
        documentation: 'https://grafana.com/docs/',
        initialRelease: '2014',
        versions: []
      },
      // Package Managers
      {
        name: 'Helm',
        domain: ['devops', 'tools'],
        description: 'Gestionnaire de packages pour Kubernetes',
        logoUrl: 'https://helm.sh/img/helm.svg',
        documentation: 'https://helm.sh/docs/',
        initialRelease: '2015',
        versions: []
      },
      // Security
      {
        name: 'Vault',
        domain: ['devops', 'tools'],
        description: 'Gestion des secrets et chiffrement',
        logoUrl: 'https://www.datocms-assets.com/2885/1620159869-brandvaultprimaryattributedcolor.svg',
        documentation: 'https://developer.hashicorp.com/vault/docs',
        initialRelease: '2015',
        versions: []
      },
      {
        name: 'SonarQube',
        domain: ['devops', 'tools'],
        description: 'Plateforme d\'analyse de qualité de code',
        logoUrl: 'https://www.sonarqube.org/logos/index/sonarqube-logo.svg',
        documentation: 'https://docs.sonarsource.com/sonarqube/',
        initialRelease: '2007',
        versions: []
      },
      // Containerization
      {
        name: 'Podman',
        domain: ['devops', 'tools'],
        description: 'Moteur de conteneurs daemonless',
        logoUrl: 'https://podman.io/images/podman.svg',
        documentation: 'https://docs.podman.io/',
        initialRelease: '2018',
        versions: []
      },

      // === IMPORTANTS ===
      // CI/CD
      {
        name: 'CircleCI',
        domain: ['devops', 'tools'],
        description: 'Plateforme CI/CD cloud',
        logoUrl: 'https://circleci.com/circleci-logo-stacked-fb.png',
        documentation: 'https://circleci.com/docs/',
        initialRelease: '2011',
        versions: []
      },
      {
        name: 'Azure DevOps',
        domain: ['devops', 'tools'],
        description: 'Suite DevOps de Microsoft',
        logoUrl: 'https://azure.microsoft.com/svghandler/azure-devops/?width=600&height=315',
        documentation: 'https://learn.microsoft.com/en-us/azure/devops/',
        initialRelease: '2018',
        versions: []
      },
      // IaC
      {
        name: 'Pulumi',
        domain: ['devops', 'tools'],
        description: 'IaC moderne avec des langages de programmation',
        logoUrl: 'https://www.pulumi.com/logos/brand/logo-on-white.svg',
        documentation: 'https://www.pulumi.com/docs/',
        initialRelease: '2018',
        versions: []
      },
      // Configuration Management
      {
        name: 'Puppet',
        domain: ['devops', 'tools'],
        description: 'Automatisation de configuration d\'infrastructure',
        logoUrl: 'https://puppet.com/sites/default/files/2021-06/puppet-logo-amber-black.svg',
        documentation: 'https://www.puppet.com/docs/',
        initialRelease: '2005',
        versions: []
      },
      {
        name: 'Chef',
        domain: ['devops', 'tools'],
        description: 'Automatisation d\'infrastructure as code',
        logoUrl: 'https://www.chef.io/static/chef-logo-4c7682753c5a61c0cedc5d1f3f3c3d99.svg',
        documentation: 'https://docs.chef.io/',
        initialRelease: '2009',
        versions: []
      },
      // Service Mesh
      {
        name: 'Istio',
        domain: ['devops', 'tools'],
        description: 'Service mesh open-source',
        logoUrl: 'https://istio.io/latest/img/istio-bluelogo-whitebackground-unframed.svg',
        documentation: 'https://istio.io/latest/docs/',
        initialRelease: '2017',
        versions: []
      },
      {
        name: 'Linkerd',
        domain: ['devops', 'tools'],
        description: 'Service mesh ultraléger pour Kubernetes',
        logoUrl: 'https://linkerd.io/images/logo.png',
        documentation: 'https://linkerd.io/2/overview/',
        initialRelease: '2016',
        versions: []
      },
      {
        name: 'Consul',
        domain: ['devops', 'tools'],
        description: 'Service mesh et service discovery',
        logoUrl: 'https://www.datocms-assets.com/2885/1620159869-brandconsulprimaryattributedcolor.svg',
        documentation: 'https://developer.hashicorp.com/consul/docs',
        initialRelease: '2014',
        versions: []
      },
      // GitOps
      {
        name: 'ArgoCD',
        domain: ['devops', 'tools'],
        description: 'Outil GitOps déclaratif pour Kubernetes',
        logoUrl: 'https://argo-cd.readthedocs.io/en/stable/assets/logo.png',
        documentation: 'https://argo-cd.readthedocs.io/',
        initialRelease: '2018',
        versions: []
      },
      {
        name: 'Flux',
        domain: ['devops', 'tools'],
        description: 'Outil GitOps pour Kubernetes',
        logoUrl: 'https://fluxcd.io/img/logos/flux-horizontal-color.png',
        documentation: 'https://fluxcd.io/docs/',
        initialRelease: '2016',
        versions: []
      },
      // Logging
      {
        name: 'Fluentd',
        domain: ['devops', 'tools'],
        description: 'Collecteur de logs unifié open-source',
        logoUrl: 'https://www.fluentd.org/assets/img/miscellany/fluentd-logo_2x.png',
        documentation: 'https://docs.fluentd.org/',
        initialRelease: '2011',
        versions: []
      },
      {
        name: 'Loki',
        domain: ['devops', 'tools'],
        description: 'Système d\'agrégation de logs par Grafana',
        logoUrl: 'https://grafana.com/static/img/logos/logo-loki.svg',
        documentation: 'https://grafana.com/docs/loki/latest/',
        initialRelease: '2018',
        versions: []
      },
      // Monitoring
      {
        name: 'Datadog',
        domain: ['devops', 'tools'],
        description: 'Plateforme de monitoring et analytics',
        logoUrl: 'https://imgix.datadoghq.com/img/about/presskit/logo-v/dd_vertical_purple.png',
        documentation: 'https://docs.datadoghq.com/',
        initialRelease: '2010',
        versions: []
      },
      // Package Managers
      {
        name: 'Kustomize',
        domain: ['devops', 'tools'],
        description: 'Personnalisation des configurations Kubernetes',
        logoUrl: 'https://kubernetes.io/images/blog/2018-05-29-introducing-kustomize/kustomize.png',
        documentation: 'https://kubectl.docs.kubernetes.io/references/kustomize/',
        initialRelease: '2018',
        versions: []
      },
      // Security
      {
        name: 'Trivy',
        domain: ['devops', 'tools'],
        description: 'Scanner de vulnérabilités pour conteneurs',
        logoUrl: 'https://aquasecurity.github.io/trivy/v0.18.3/imgs/logo.png',
        documentation: 'https://aquasecurity.github.io/trivy/',
        initialRelease: '2019',
        versions: []
      },
      {
        name: 'Snyk',
        domain: ['devops', 'tools'],
        description: 'Plateforme de sécurité pour développeurs',
        logoUrl: 'https://snyk.io/wp-content/uploads/snyk-logo-black.svg',
        documentation: 'https://docs.snyk.io/',
        initialRelease: '2015',
        versions: []
      },
      // Testing
      {
        name: 'Selenium',
        domain: ['devops', 'tools'],
        description: 'Framework de test automatisé pour web',
        logoUrl: 'https://www.selenium.dev/images/selenium_logo_square_green.png',
        documentation: 'https://www.selenium.dev/documentation/',
        initialRelease: '2004',
        versions: []
      },
      {
        name: 'k6',
        domain: ['devops', 'tools'],
        description: 'Outil de test de charge moderne',
        logoUrl: 'https://k6.io/images/k6-logo.svg',
        documentation: 'https://k6.io/docs/',
        initialRelease: '2017',
        versions: []
      },
      // Orchestration
      {
        name: 'Nomad',
        domain: ['devops', 'tools'],
        description: 'Orchestrateur de workloads simple et flexible',
        logoUrl: 'https://www.datocms-assets.com/2885/1620155117-brandnomadprimaryattributedcolor.svg',
        documentation: 'https://developer.hashicorp.com/nomad/docs',
        initialRelease: '2015',
        versions: []
      },

      // Update existing to add devops domain
      { name: 'Python', addDevopsOnly: true },
      { name: 'Go', addDevopsOnly: true },
      { name: 'Bash', addDevopsOnly: true },
      { name: 'YAML', addDevopsOnly: true }
    ];

    let created = 0;
    let updated = 0;
    let skipped = 0;

    for (const item of devopsItems) {
      const existing = await langageModel.findOne({ name: item.name }).exec();

      if (existing) {
        if (item.addDevopsOnly) {
          if (!existing.domain.includes('devops')) {
            await langageModel.updateOne(
              { name: item.name },
              { $addToSet: { domain: 'devops' } }
            ).exec();
            console.log(`  ✅ ${item.name}: domaine 'devops' ajouté`);
            updated++;
          } else {
            console.log(`  ⏭️  ${item.name}: déjà dans le domaine devops`);
            skipped++;
          }
        } else {
          const newDomains = [...new Set([...existing.domain, ...(item.domain || [])])];
          if (newDomains.length !== existing.domain.length) {
            await langageModel.updateOne(
              { name: item.name },
              { $set: { domain: newDomains } }
            ).exec();
            console.log(`  ✅ ${item.name}: domaines mis à jour`);
            updated++;
          } else {
            console.log(`  ⏭️  ${item.name}: existe déjà avec les bons domaines`);
            skipped++;
          }
        }
      } else {
        if (!item.addDevopsOnly) {
          const newItem = {
            name: item.name,
            domain: item.domain,
            description: item.description || '',
            logoUrl: item.logoUrl || '',
            documentation: item.documentation || '',
            initialRelease: item.initialRelease || '',
            versions: item.versions || [],
            recommendations: 0
          };

          await langageModel.create(newItem);
          console.log(`  ✅ ${item.name}: créé`);
          created++;
        } else {
          console.log(`  ⚠️  ${item.name}: n'existe pas en base`);
          skipped++;
        }
      }
    }

    console.log('\n═══════════════════════════════════════════════════════════');
    console.log(`\n📊 Résumé:`);
    console.log(`  • Créés: ${created}`);
    console.log(`  • Mis à jour: ${updated}`);
    console.log(`  • Ignorés: ${skipped}`);
    console.log(`  • Total traité: ${devopsItems.length}`);

  } finally {
    await app.close();
  }
}

addDevopsEssentials().catch(error => {
  console.error('❌ Erreur:', error);
  process.exit(1);
});
