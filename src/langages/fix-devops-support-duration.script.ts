import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { Model } from 'mongoose';

async function fixDevopsSupportDuration() {
  const app = await NestFactory.createApplicationContext(AppModule);

  try {
    const langageModel = app.get<Model<any>>('LangageModel');

    console.log('🚀 AJOUT DES SUPPORT DURATION POUR LES OUTILS DEVOPS\n');
    console.log('═══════════════════════════════════════════════════════════\n');

    // Valeurs à appliquer (en mois)
    const supportDurations: Record<string, Record<string, number>> = {
      // IaC - outils stables, cycles longs
      'Terraform': { 'current': 18 },
      'Pulumi': { 'current': 12 },
      'Puppet': { 'current': 24 },
      'Chef': { 'current': 24 },

      // CI/CD - outils de production, updates fréquents
      'Jenkins': { 'current': 12 },
      'GitHub Actions': { 'current': 6 },
      'GitLab CI': { 'current': 12 },
      'CircleCI': { 'current': 12 },
      'Azure DevOps': { 'current': 12 },

      // Containerization
      'Podman': { 'current': 12 },

      // Orchestration
      'Nomad': { 'current': 18 },

      // Monitoring - outils critiques, stables
      'Prometheus': { 'current': 18 },
      'Grafana': { 'current': 18 },
      'Datadog': { 'current': 12 },

      // Logging
      'Fluentd': { 'current': 18 },
      'Loki': { 'current': 12 },

      // Service Mesh - nouvelles technologies
      'Istio': { 'current': 12 },
      'Linkerd': { 'current': 12 },
      'Consul': { 'current': 18 },

      // GitOps - technologies récentes
      'ArgoCD': { 'current': 12 },
      'Flux': { 'current': 12 },

      // Package Managers
      'Helm': { 'current': 18 },
      'Kustomize': { 'current': 12 },

      // Security - updates fréquents pour sécurité
      'Vault': { 'current': 18 },
      'SonarQube': { 'current': 12 },
      'Trivy': { 'current': 6 },
      'Snyk': { 'current': 6 },

      // Testing
      'Selenium': { 'current': 18 },
      'k6': { 'current': 12 }
    };

    let updated = 0;
    let created = 0;

    for (const [toolName, versionDurations] of Object.entries(supportDurations)) {
      const tool = await langageModel.findOne({ name: toolName }).exec();

      if (!tool) {
        console.log(`❌ ${toolName}: Non trouvé`);
        continue;
      }

      let modified = false;

      // Si pas de versions, créer la version current
      if (!tool.versions || tool.versions.length === 0) {
        tool.versions = [];
        for (const [type, duration] of Object.entries(versionDurations)) {
          tool.versions.push({
            type,
            label: 'N/A',
            supportDuration: duration,
            releaseDate: new Date().toISOString()
          });
          console.log(`  ✅ ${toolName} - ${type}: ${duration} mois (créé)`);
          created++;
        }
        modified = true;
      } else {
        // Mettre à jour les versions existantes
        for (const version of tool.versions) {
          const duration = versionDurations[version.type];
          if (duration !== undefined) {
            version.supportDuration = duration;
            console.log(`  ✅ ${toolName} - ${version.type}: ${duration} mois`);
            modified = true;
            updated++;
          }
        }

        // Créer les versions manquantes
        for (const [type, duration] of Object.entries(versionDurations)) {
          if (!tool.versions.find((v: any) => v.type === type)) {
            tool.versions.push({
              type,
              label: 'N/A',
              supportDuration: duration,
              releaseDate: new Date().toISOString()
            });
            console.log(`  ✅ ${toolName} - ${type}: ${duration} mois (créé)`);
            created++;
            modified = true;
          }
        }
      }

      if (modified) {
        await tool.save();
      }
    }

    console.log('\n═══════════════════════════════════════════════════════════');
    console.log(`\n📊 Résumé:`);
    console.log(`  • Versions mises à jour: ${updated}`);
    console.log(`  • Versions créées: ${created}`);

  } finally {
    await app.close();
  }
}

fixDevopsSupportDuration().catch(error => {
  console.error('❌ Erreur:', error);
  process.exit(1);
});
