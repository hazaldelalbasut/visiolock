using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace VisioLockApi.Migrations
{
    /// <inheritdoc />
    public partial class KullaniciEkle : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Kullanicilar",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Email = table.Column<string>(type: "text", nullable: false),
                    SifreHash = table.Column<string>(type: "text", nullable: false),
                    OlusturmaTarihi = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Kullanicilar", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_SifreKayitlari_KullaniciId",
                table: "SifreKayitlari",
                column: "KullaniciId");

            migrationBuilder.AddForeignKey(
                name: "FK_SifreKayitlari_Kullanicilar_KullaniciId",
                table: "SifreKayitlari",
                column: "KullaniciId",
                principalTable: "Kullanicilar",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_SifreKayitlari_Kullanicilar_KullaniciId",
                table: "SifreKayitlari");

            migrationBuilder.DropTable(
                name: "Kullanicilar");

            migrationBuilder.DropIndex(
                name: "IX_SifreKayitlari_KullaniciId",
                table: "SifreKayitlari");
        }
    }
}
