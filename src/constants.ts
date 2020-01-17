export class Constants {
    static readonly AIDungeon = 'AIDungeon';
    static readonly AIDungeonRepoPath = `./system/repos/${Constants.AIDungeon}`;
    static readonly AIDungeonModelPath = `${Constants.AIDungeonRepoPath}/generator/gpt2/models`;

    static readonly thadunge2 = 'thadunge2';
    static readonly thadunge2RepoPath = `./system/repos/${Constants.thadunge2}`;
    static readonly thadunge2ModelPath = `${Constants.thadunge2RepoPath}/generator/gpt2/models`;

    static readonly CloverEdition = 'CloverEdition';
    static readonly CloverEditionRepoPath = `./system/repos/${Constants.CloverEdition}`;
    static readonly CloverEditionModelPath = `${Constants.CloverEditionRepoPath}/models`;

    static readonly InstallAnotherGameChoice = '(Install another game)';
    static readonly CancelChoice = '(Cancel)';

    static readonly AIDungeonDefaultModelMagnetLink = "magnet:?xt=urn:btih:b343b83b35bff774dab13e0281ce13b3daf37d3e&dn=model_v5";
    static readonly CloverEditionDefaultModelMagnetLink = "magnet:?xt=urn:btih:17dcfe3d12849db04a3f64070489e6ff5fc6f63f&dn=model_v5_pytorch&tr=udp%3a%2f%2ftracker.opentrackr.org%3a1337%2fannounce&tr=udp%3a%2f%2fopen.stealth.si%3a80%2fannounce&tr=udp%3a%2f%2fp4p.arenabg.com%3a1337%2fannounce&tr=udp%3a%2f%2ftracker.coppersurfer.tk%3a6969%2fannounce&tr=udp%3a%2f%2ftracker.cyberia.is%3a6969%2fannounce&tr=udp%3a%2f%2ftracker.moeking.me%3a6969%2fannounce&tr=udp%3a%2f%2f9.rarbg.me%3a2710%2fannounce&tr=udp%3a%2f%2ftracker3.itzmx.com%3a6961%2fannounce";

    static readonly SupportedGames = [
        Constants.AIDungeon,
        Constants.thadunge2,
        Constants.CloverEdition
    ];
}