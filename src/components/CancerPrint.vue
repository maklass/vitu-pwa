<template>
  <div>
    <div class="cancer-print">
      <div class="genes">
        <div class="gene" v-for="(gene, index) in genes" :key="index">{{ gene }}</div>
      </div>
      <div class="canvas-wrapper">
        <canvas ref="study-canvas"></canvas>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      provider: {
        context: null
      },

      study: [
        {
          name: "TSCA-255",
          KRAS: "",
          BRCA: "MUT",
          BRAF: "AMP",
          HRAS: "HOMDEL"
        },
        {
          name: "TSCA-255",
          KRAS: "",
          BRCA: "",
          BRAF: "AMP",
          HRAS: ""
        },
        {
          name: "TSCA-255",
          KRAS: "",
          BRCA: "",
          BRAF: "AMP",
          HRAS: ""
        },
        {
          name: "TSCA-255",
          KRAS: "",
          BRCA: "",
          BRAF: "AMP",
          HRAS: ""
        },
        {
          name: "TSCA-255",
          KRAS: "",
          BRCA: "",
          BRAF: "AMP",
          HRAS: ""
        },
        {
          name: "TSCA-255",
          KRAS: "",
          BRCA: "",
          BRAF: "AMP",
          HRAS: ""
        },
        {
          name: "TSCA-255",
          KRAS: "",
          BRCA: "",
          BRAF: "AMP",
          HRAS: ""
        },
        {
          name: "TSCA-255",
          KRAS: "",
          BRCA: "",
          BRAF: "AMP",
          HRAS: ""
        },
        {
          name: "TSCA-255",
          KRAS: "",
          BRCA: "",
          BRAF: "AMP",
          HRAS: ""
        },
        {
          name: "TSCA-255",
          KRAS: "",
          BRCA: "",
          BRAF: "AMP",
          HRAS: ""
        },
        {
          name: "TSCA-255",
          KRAS: "",
          BRCA: "",
          BRAF: "AMP",
          HRAS: ""
        },
        {
          name: "TSCA-255",
          KRAS: "",
          BRCA: "",
          BRAF: "AMP",
          HRAS: ""
        },
        {
          name: "TSCA-255",
          KRAS: "",
          BRCA: "",
          BRAF: "AMP",
          HRAS: ""
        },
        {
          name: "TSCA-255",
          KRAS: "",
          BRCA: "",
          BRAF: "AMP",
          HRAS: ""
        },
        {
          name: "TSCA-255",
          KRAS: "",
          BRCA: "",
          BRAF: "AMP",
          HRAS: ""
        },
        {
          name: "TSCA-255",
          KRAS: "",
          BRCA: "",
          BRAF: "AMP",
          HRAS: ""
        },
        {
          name: "TSCA-255",
          KRAS: "",
          BRCA: "",
          BRAF: "AMP",
          HRAS: ""
        },
        {
          name: "TSCA-255",
          KRAS: "",
          BRCA: "",
          BRAF: "AMP",
          HRAS: ""
        },
        {
          name: "TSCA-255",
          KRAS: "",
          BRCA: "",
          BRAF: "AMP",
          HRAS: ""
        },
        {
          name: "TSCA-255",
          KRAS: "",
          BRCA: "",
          BRAF: "AMP",
          HRAS: ""
        },
        {
          name: "TSCA-255",
          KRAS: "",
          BRCA: "",
          BRAF: "AMP",
          HRAS: ""
        },
        {
          name: "TSCA-255",
          KRAS: "",
          BRCA: "",
          BRAF: "AMP",
          HRAS: ""
        },
        {
          name: "TSCA-255",
          KRAS: "",
          BRCA: "",
          BRAF: "AMP",
          HRAS: ""
        },
        {
          name: "TSCA-255",
          KRAS: "",
          BRCA: "",
          BRAF: "AMP",
          HRAS: ""
        },
        {
          name: "TSCA-255",
          KRAS: "",
          BRCA: "",
          BRAF: "AMP",
          HRAS: ""
        },
        {
          name: "TSCA-255",
          KRAS: "",
          BRCA: "",
          BRAF: "AMP",
          HRAS: ""
        },
        {
          name: "TSCA-255",
          KRAS: "",
          BRCA: "",
          BRAF: "AMP",
          HRAS: ""
        },
        {
          name: "TSCA-255",
          KRAS: "",
          BRCA: "",
          BRAF: "AMP",
          HRAS: ""
        },
        {
          name: "TSCA-255",
          KRAS: "",
          BRCA: "",
          BRAF: "AMP",
          HRAS: ""
        },
        {
          name: "TSCA-255",
          KRAS: "",
          BRCA: "",
          BRAF: "AMP",
          HRAS: ""
        },
        {
          name: "TSCA-255",
          KRAS: "",
          BRCA: "",
          BRAF: "AMP",
          HRAS: ""
        },
        {
          name: "TSCA-255",
          KRAS: "",
          BRCA: "",
          BRAF: "AMP",
          HRAS: ""
        },
        {
          name: "TSCA-255",
          KRAS: "",
          BRCA: "",
          BRAF: "AMP",
          HRAS: ""
        },
        {
          name: "TSCA-255",
          KRAS: "",
          BRCA: "",
          BRAF: "AMP",
          HRAS: ""
        }
      ],

      genes: ["KRAS", "BRCA", "BRAF", "HRAS"]
    };
  },

  methods: {
    render() {
      const ctx = this.provider.context;
      const width = 10;
      const height = 30;
      const gapX = 4;
      const gapY = 10;

      this.study.forEach((patient, patientIndex) => {
        this.genes.forEach((gene, geneIndex) => {
          switch (patient[gene]) {
            case "MUT":
              ctx.fillStyle = "red";
              break;
            case "AMP":
              ctx.fillStyle = "blue";
              break;
            case "HOMDEL":
              ctx.fillStyle = "green";
              break;
            default:
              ctx.fillStyle = "grey";
          }

          ctx.fillRect(patientIndex * width + patientIndex * gapX, geneIndex * height + geneIndex * gapY, width, height);
        });
      });
    }
  },

  mounted() {
    this.provider.context = this.$refs["study-canvas"].getContext("2d");

    this.$refs["study-canvas"].width = this.$refs["study-canvas"].parentElement.clientWidth;
    this.$refs["study-canvas"].height = this.$refs["study-canvas"].parentElement.clientHeight;

    this.render();
  }
};
</script>

<style scoped>
.cancer-print {
  display: flex;
}

.canvas-wrapper {
  height: 800px;
  flex: 1;
}

.genes {
  display: flex;
  flex-direction: column;
  margin-right: 14px;
}

.gene {
  height: 30px;
  margin-bottom: 10px;
  font-weight: bold;
  display: flex;
  align-items: center;
}
</style>
