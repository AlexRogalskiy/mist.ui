import { MACHINE_NAME_REGEX_PATTERNS } from './machine-name-regex-patterns.js';
// I should get image id from image name before submitting to the API
// I should get size if from size name before submitting to the API
const MACHINE_CREATE_FORM_DATA = data => ({
  src: './assets/forms/create-machine/create-machine.json',
  formData: {
    dynamicData: {
      clouds: {
        func: new Promise(resolve => {
          // Wait until clouds have loaded here
          resolve(() =>
            data.clouds.map(cloud => ({
              ...cloud,
              image: `assets/providers/provider-${cloud.provider}.png`,
              alt: '',
            }))
          );
        }),
      },
      getZones: {
        func: new Promise(resolve => {
          // Wait until clouds have loaded here
          resolve(() =>
            data._toArray(data.model.zones).map(zone => {
              return {
                id: zone.id,
                title: zone.zone_id,
              };
            })
          );
        }),
      },
      getipv6Subnets: {
        func: new Promise(resolve => {
          // Wait until clouds have loaded here
          resolve(() => {
            const arr = [];
            for (let i = 64; i < 128; i++) {
              arr.push(`\${i}`);
            }
            return arr;
          });
        }),
      },
      getScripts: {
        func: new Promise(resolve => {
          // Wait until clouds have loaded here
          resolve(() => {
            return data.model.scriptsArray.map(script => ({
              id: script.id,
              title: script.name,
            }));
          });
        }),
      },
    },
    conditionals: {
      showSetupMachineContainer: {
        func: cloudId => !cloudId,
      },
      getNameRegex: {
        func: cloudId => {
          const provider =
            data._getCloudById(cloudId) && data._getCloudById(cloudId).provider;
          const pattern =
            (provider && MACHINE_NAME_REGEX_PATTERNS[provider]) ||
            MACHINE_NAME_REGEX_PATTERNS['default'];
          console.log('pattern ', pattern);
          return pattern;
        },
      },
      getLocations: {
        func: (id, path, formValues) => {
          if (!id) {
            return undefined;
          }
          const cloudId =
            path === 'cloudContainer.cloud'
              ? id
              : formValues.cloudContainer && formValues.cloudContainer.cloud;
          const locationsArray =
            data._getCloudById(cloudId).locationsArray || [];
          switch (path) {
            case 'cloudContainer.cloud': {
              const locations = locationsArray.map(location => ({
                ...location,
                title: location.name,
              }));
              return locations;
            }
            case 'setupMachine.image': {
              const locationsFromImage = locationsArray
                .filter(location => {
                  // Find correct imageName
                  console.log('location ', location);
                  console.log(
                    'location.available_images ',
                    location.available_images
                  );
                  return (
                    !location.available_images ||
                    location.available_images.includes(id)
                  );
                })
                .map(location => ({ ...location, title: location.name }));
              console.log('locationsFromImage ', locationsFromImage);
              return locationsFromImage;
            }
            case 'setupMachine.size': {
              // Find the correct sizeName
              const locationsFromSize = locationsArray
                .filter(
                  location =>
                    !location.available_sizes ||
                    location.available_sizes.includes(id)
                )
                .map(location => ({ ...location, title: location.name }));
              return locationsFromSize;
            }
            default: {
              return undefined;
            }
          }
        },
      },
      getImages: {
        func: (id, path, formValues) => {
          if (!id) {
            return undefined;
          }
          const cloudId =
            path === 'cloudContainer.cloud'
              ? id
              : formValues.cloudContainer && formValues.cloudContainer.cloud;
          const cloud = data._getCloudById(cloudId);
          const imagesArray = data._getCloudById(cloudId).imagesArray || [];
          switch (path) {
            case 'cloudContainer.cloud': {
              const images = imagesArray.map(image => image.name);
              return images;
            }
            case 'setupMachine.location': {
              const location = cloud.locations[id];
              return location.available_images || undefined;
            }
            case 'setupMachine.size': {
              // const imagesFromSize =  imagesArray.filter(size=>
              //   !size.available_images || size.available_images.includes(sizeName)
              //   )
              // .map(size => (
              //   {...size, title:size.name}
              // ));
              //   return locationsFromSize;
              break;
            }
            default: {
              return undefined;
            }
          }
        },
      },
      getSizes: {
        func: (id, path, formValues) => {
          if (!id) {
            return undefined;
          }
          const cloudId =
            path === 'cloudContainer.cloud'
              ? id
              : formValues.cloudContainer && formValues.cloudContainer.cloud;
          let cloud;
          switch (path) {
            case 'cloudContainer.cloud': {
              cloud = data._getCloud(cloudId) || {};
              return cloud.size || {};
            }
            case 'setupMachine.location': {
              cloud = data._getCloudById(cloudId);

              const location = cloud.locations[id];

              return location.available_sizes || undefined;
            }
            case 'setupMachine.image': {
              // const imagesFromSize =  imagesArray.filter(size=>
              //   !size.available_images || size.available_images.includes(id)
              //   )
              // .map(size => (
              //   {...size, title:size.name}
              // ));
              //   return locationsFromSize;
              break;
            }
            default: {
              return undefined;
            }
          }
        },
      },
      hideNetworkContainer: {
        func: cloudId => {
          const provider = data._getProviderById(cloudId);
          const cloudsWithNetworks = [
            'ec2',
            'azure_arm',
            'equinixmetal',
            'gce',
            'libvirt',
            'linode',
            'openstack',
            'aliyun_ecs',
          ];
          return !cloudsWithNetworks.includes(provider);
        },
      },
      // Add min max limits here
      getCidrRestrictions: {
        func: addressType => {
          if (addressType === 4) {
            return undefined;
          } else {
            return undefined;
          }
        },
      },
      hideNetwork: {
        func: cloudId =>
          !['gce', 'aliyun_ecs'].includes(data._getProviderById(cloudId)),
      },
      getNetworks: {
        // This field is for multiple providers
        func: cloudId => {
          const cloud = data._getCloudById(cloudId);
          const networks = [];
          const provider = data._getProviderById(cloudId);
          if (provider === 'gce') {
            if (cloud.networks.length) {
              for (const network of Object.values(cloud.networks)) {
                networks.push({
                  title: network.name,
                  id: network.id,
                });
              }
            }
          }
          return networks;
        },
      },
      showVolumeContainer: {
        func: cloudId => {
          const provider = data._getProviderById(cloudId);
          const cloudsWithVolumes = [
            'ec2',
            'azure_arm',
            'digitalocean',
            'equinixmetal',
            'gce',
            'linode',
            'openstack',
            'aliyun_ecs',
          ];
          return !cloudsWithVolumes.includes(provider);
        },
      },
      hideAttachExistingVolumeContainer: {
        func: tab => tab !== 'Attach existing volume',
      },
      hideAttachNewVolumeContainer: {
        func: tab => tab !== 'Create new volume',
      },
      showDeviceNameInNewVolume: {
        func: cloudId =>
          ['equinixmetal', 'openstack', 'aliyun_ecs'].includes(
            data._getProviderById(cloudId)
          ),
      },
      showVolumeBoot: {
        func: cloudId =>
          !['gce', 'openstack'].includes(data._getProviderById(cloudId)),
      },
      hideDeleteTerminationInNewVolume: {
        func: cloudId => {
          return !['ec2', 'openstack', 'aliyun_ecs'].includes(
            data._getProviderById(cloudId)
          );
        },
      },
      hideIfNotAmazon: {
        func: cloudId => data._getProviderById(cloudId) !== 'ec2',
      },
      hideIfNotAzure: {
        func: cloudId => data._getProviderById(cloudId) !== 'azure_arm',
      },
      hideIfNotDigitalOcean: {
        func: cloudId => data._getProviderById(cloudId) !== 'digitalocean',
      },
      hideIfNotEquinix: {
        func: cloudId => data._getProviderById(cloudId) !== 'equinixmetal',
      },
      // One volume should set this
      hideIfNotGoogle: {
        func: cloudId => data._getProviderById(cloudId) !== 'gce',
      },
      hideIfNotLinode: {
        func: cloudId => data._getProviderById(cloudId) !== 'linode',
      },
      hideIfNotKVM: {
        func: cloudId => data._getProviderById(cloudId) !== 'libvirt',
      },
      hideIfNotOpenstack: {
        func: cloudId => {
          return data._getProviderById(cloudId) !== 'openstack';
        },
      },
      hideDeleteOnTerminationExisting: {
        func: cloudId => {
          return !['aliyun_ecs', 'openstack'].includes(
            data._getProviderById(cloudId)
          );
        },
      },
      hideSecurityGroup: {
        func: cloudId => {
          return !['ec2', 'aliyun_ecs'].includes(
            data._getProviderById(cloudId)
          );
        },
      },
      hideLocations: {
        func: cloudId => {
          return ['lxd', 'docker', 'kubevirt'].includes(
            data._getProviderById(cloudId)
          );
        },
      },
      getSecurityGroups: {
        func: cloudId => {
          return cloudId ? data._getAmazonSecurityGroups(cloudId) : [];
        },
        type: 'promise',
      },
      hideipv4SubnetSize: {
        func: toggle => toggle,
      },
      hideipv6SubnetSize: {
        func: toggle => toggle,
      },
      getVolumeTypes: {
        func: cloudId => {
          const provider = data._getProviderById(cloudId);
          switch (provider) {
            case 'aliyun_ecs':
              return ['cloud', 'cloud_efficiency', 'cloud_ssd', 'cloud_essd'];
            case 'gce':
              return ['pd-standard', 'pd-ssd'];
            default:
              return [];
          }
        },
      },
      getSubnets: {
        func: (locationId, fieldpath, formValues) => {
          const cloudId =
            formValues.cloudContainer && formValues.cloudContainer.cloud;
          const cloud = data._getCloudById(cloudId);
          const subnets = [];
          if (cloud && cloud.networks) {
            for (const network of Object.values(cloud.networks)) {
              if (network.subnets) {
                for (const subnet of Object.values(network.subnets)) {
                  // There's also an availability zone property in subnets containing location names, does it mean subnets are based on location too?
                  if (
                    cloud.locations[locationId].name ===
                    subnet.availability_zone
                  ) {
                    subnets.push({
                      title: subnet.name,
                      id: subnet.id,
                    });
                  }
                }
              }
            }
          }
          return subnets;
        },
      },
      showExistingVolume: {
        func: choice => choice === 'Create new volume',
      },
      getVolumesFromLocations: {
        func: location => {
          const volumes = [];
          for (const value of Object.values(data.volumes)) {
            if (value.location === location) {
              volumes.push({
                title: value.name,
                id: value.id,
              });
            }
          }
          return volumes;
        },
      },
      hideTaskScriptContainer: {
        func: type => type !== 'run script',
      },
      hideOneOffContainer: {
        func: type => type !== 'one_off',
      },
      hideCrontabContainer: {
        func: type => type !== 'crontab',
      },
      hideIntervalContainer: {
        func: type => type !== 'interval',
      },
      hideTemplateName: {
        func: saveAsTemplate => !saveAsTemplate,
      },
    },
  },
});

export { MACHINE_CREATE_FORM_DATA };
