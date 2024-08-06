{
  description = "Flake for my system packages";

  inputs = {
    nixpkgs.url = "github:nixos/nixpkgs?ref=nixos-unstable";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs = { self, nixpkgs, flake-utils }:
    flake-utils.lib.eachDefaultSystem (system:
      let pkgs = nixpkgs.legacyPackages.${system}; in
      {
        devShells = {
          default = pkgs.mkShell {
            buildInputs = with pkgs; [
              turso-cli
              nodePackages_latest.typescript-language-server
              emmet-language-server
              nodePackages_latest.prettier
              tailwindcss-language-server
              vscode-langservers-extracted
            ];
          };
        };
      }
    );
}
