import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { Model } from 'mongoose';

async function checkDevopsDomain() {
  const app = await NestFactory.createApplicationContext(AppModule);

  try {
    const langageModel = app.get<Model<any>>('LangageModel');

    console.log('🚀 LANGAGES ET TOOLS DU DOMAINE "DEVOPS"\n');
    console.log('═══════════════════════════════════════════════════════════\n');

    const devopsItems = await langageModel
      .find({ domain: 'devops' })
      .sort({ name: 1 })
      .exec();

    // Catégoriser
    const languages: any[] = [];
    const frameworks: any[] = [];
    const tools: any[] = [];
    const others: any[] = [];

    devopsItems.forEach((item: any) => {
      const domains = item.domain || [];
      if (domains.includes('language')) {
        languages.push(item);
      } else if (domains.includes('framework')) {
        frameworks.push(item);
      } else if (domains.includes('tools')) {
        tools.push(item);
      } else {
        others.push(item);
      }
    });

    console.log(`🚀 Total: ${devopsItems.length} éléments\n`);

    console.log('🔤 LANGAGES:');
    if (languages.length > 0) {
      languages.forEach((l: any) => {
        const version = l.versions?.find((v: any) => v.type === 'current')?.label || 'N/A';
        console.log(`  • ${l.name} (${version})`);
      });
    } else {
      console.log('  (aucun)');
    }

    console.log('\n🏗️ FRAMEWORKS:');
    if (frameworks.length > 0) {
      frameworks.forEach((f: any) => {
        const version = f.versions?.find((v: any) => v.type === 'current')?.label || 'N/A';
        console.log(`  • ${f.name} (${version})`);
      });
    } else {
      console.log('  (aucun)');
    }

    console.log('\n🔧 TOOLS:');
    if (tools.length > 0) {
      tools.forEach((t: any) => {
        const version = t.versions?.find((v: any) => v.type === 'current')?.label || 'N/A';
        console.log(`  • ${t.name} (${version})`);
      });
    } else {
      console.log('  (aucun)');
    }

    console.log('\n📦 AUTRES:');
    if (others.length > 0) {
      others.forEach((o: any) => {
        const version = o.versions?.find((v: any) => v.type === 'current')?.label || 'N/A';
        console.log(`  • ${o.name} (${version}) - domains: ${o.domain.join(', ')}`);
      });
    } else {
      console.log('  (aucun)');
    }

    // Suggestions
    console.log('\n\n💡 TECHNOLOGIES DEVOPS POPULAIRES À VÉRIFIER:');
    console.log('═══════════════════════════════════════════════════════════\n');

    const existingNames = devopsItems.map((i: any) => i.name.toLowerCase());

    const suggestedDevops = {
      'CI/CD': ['Jenkins', 'GitLab CI', 'GitHub Actions', 'CircleCI', 'Travis CI', 'Azure DevOps'],
      'Containerization': ['Docker', 'Podman', 'containerd', 'CRI-O'],
      'Orchestration': ['Kubernetes', 'Docker Swarm', 'Nomad', 'OpenShift'],
      'IaC (Infrastructure as Code)': ['Terraform', 'Ansible', 'Puppet', 'Chef', 'Pulumi', 'CloudFormation'],
      'Configuration Management': ['Ansible', 'Puppet', 'Chef', 'SaltStack'],
      'Monitoring': ['Prometheus', 'Grafana', 'Datadog', 'New Relic', 'Nagios', 'Zabbix'],
      'Logging': ['ELK Stack (Elasticsearch)', 'Splunk', 'Fluentd', 'Loki'],
      'Service Mesh': ['Istio', 'Linkerd', 'Consul'],
      'GitOps': ['ArgoCD', 'Flux', 'Rancher Fleet'],
      'Cloud Platforms': ['AWS', 'Azure', 'Google Cloud', 'DigitalOcean'],
      'Package Managers': ['Helm', 'Kustomize'],
      'Security': ['Vault', 'SonarQube', 'Trivy', 'Snyk'],
      'Testing': ['Selenium', 'JMeter', 'Gatling', 'k6']
    };

    for (const [category, items] of Object.entries(suggestedDevops)) {
      const missing = items.filter(item => !existingNames.includes(item.toLowerCase()));
      const present = items.filter(item => existingNames.includes(item.toLowerCase()));

      console.log(`${category}:`);
      if (present.length > 0) {
        console.log(`  ✅ Présents: ${present.join(', ')}`);
      }
      if (missing.length > 0) {
        console.log(`  ❌ Manquants: ${missing.join(', ')}`);
      }
      console.log('');
    }

  } finally {
    await app.close();
  }
}

checkDevopsDomain().catch(error => {
  console.error('❌ Erreur:', error);
  process.exit(1);
});
