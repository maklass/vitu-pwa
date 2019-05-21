<template>
  <div>
    <Navbar />
    <b-container class="documentation">
      <div class="card">
        <div class="card-body">
          <fieldset>
            <legend>Protokoll</legend>
            <p>
              Im <strong>Modul Protokoll</strong> können die <strong>Empfehlungen eines Tumorboards strukturiert erfasst</strong> werden. Hierzu können bereits vorhandene strukturierte Daten
              (Patientenstammdaten, Therapieverlauf, Therapieplan, Befunddaten, etc.) aus z.B. dem KIS importiert werden und müssen nicht erneut manuell eingetragen werden. Das Protokoll kann bereits
              vor der Tumorkonferenz mit strukturiert vorliegenden Daten vorausgefüllt werden, so dass parallel zur Videokonferenz das Konferenzprotokoll vervollständigt werden kann.
            </p>
            <p>
              Eine <strong>zusätzliche Exportoption</strong> als .PDF der über die Eingabemaske bereits strukturiert abgelegten Daten ermöglicht eine
              <strong>zeitnahe Realisierung der Unterschrift</strong> durch den verantwortlichen Arzt und bei Bedarf eine Ablage im Klinikinformationssystem.
            </p>
            <p>
              Bereits strukturiert erfasste Protokolle werden in einer <strong>klinikinternen Datenbank</strong> gespeichert und können in der Vorbereitung für weitere Fälle bei entsprechender
              Freigabe abgefragt werden.
            </p>
            <p>
              Die Eingabemaske richtet sich nach den Ansprüchen des jeweiligen Tumorboards. Das MOLIT Institut für personalisierte Medizin arbeitet derzeit an einer standardisierten Eingabemaske für
              Molekulare Tumorboards. Bei Interesse nehmen Sie gern <a href="https://molit.eu/projekte/vitu/" target="_blank">Kontakt</a> mit uns auf.
            </p>
          </fieldset>
        </div>
      </div>
    </b-container>
  </div>
</template>

<script>
import Navbar from "@/components/Navbar";

export default {
  components: {
    Navbar
  }
};
</script>

<style lang="scss" scoped>
.documentation {
  padding-top: 15px;
  padding-bottom: 15px;
  .card {
    background: white;
  }
}
</style>
