export class Constants {
    static readonly AIDungeon = 'AIDungeon';
    static readonly AIDungeonRepoPath = `./system/repos/${Constants.AIDungeon}`;
    static readonly AIDungeonModelPath = `${Constants.AIDungeonRepoPath}/generator/gpt2/models`;

    static readonly thadunge2 = 'thadunge2';
    static readonly thadunge2RepoPath = `./system/repos/${Constants.thadunge2}`;
    static readonly thadunge2ModelPath = `${Constants.thadunge2RepoPath}/generator/gpt2/models`;

    static readonly InstallAnotherGameChoice = '(Install another game)';
    static readonly CancelChoice = '(Cancel)';

    static readonly AIDungeonDefaultModelMagnetLink = "magnet:?xt=urn:btih:b343b83b35bff774dab13e0281ce13b3daf37d3e&dn=model_v5";

    static readonly SupportedGames = [
        Constants.AIDungeon,
        Constants.thadunge2
    ];
}