import re

with open('index.html', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Update Invitation Text
invitation_target = """<p class="eyebrow">Bienvenue à notre célébration</p>
                <h2 class="stitle">Cher(e) Invité(e)</h2>
                <div class="gold-line"></div>
                <p class="inv-big">Nous sommes heureux de vous convier à la célébration de notre union,<br><em>Aïda
                        &amp; Khadim</em></p>
                <div class="gold-line"></div>
                <p class="inv-body">Vous êtes cordialement invités à partager avec nous ce moment unique et précieux.
                    Votre présence sera notre plus beau cadeau en ce jour de bonheur.</p>
                <div style="margin-top:40px;text-align:center">
                    <p style="font-size:10px;letter-spacing:4px;text-transform:uppercase;color:var(--gold)">Samedi 25
                        Juillet 2026</p>
                    <p
                        style="font-family:'Cormorant Garamond',serif;font-size:22px;font-style:italic;color:var(--dark);margin-top:8px">
                        De 20h00 à 01h</p>
                </div>"""

invitation_replacement = """<h2 class="stitle">Cher(e) Invité(e)</h2>
                <div class="gold-line"></div>
                <p class="inv-big">Deux âmes qui se rencontrent, deux chemins qui s’unissent.</p>
                <p class="inv-body" style="margin-top: 20px;">Animés par l’amour et le désir de construire notre avenir ensemble, nous avons choisi de lier nos vies pour toujours.<br><br>C’est avec une immense joie que nous vous invitons à partager ce moment unique, empreint d’émotion, de bonheur et de magie.<br><br>Votre présence à nos côtés sera le plus beau des cadeaux et contribuera à rendre cette journée encore plus mémorable.</p>
                <div style="margin-top:40px;text-align:center">
                    <p style="font-size:12px;letter-spacing:4px;text-transform:uppercase;color:var(--gold)">📅 Samedi 25 Juillet 2026</p>
                    <p style="font-family:'Cormorant Garamond',serif;font-size:22px;font-style:italic;color:var(--dark);margin-top:8px">🕗 De 20h00 à 01h00</p>
                </div>"""

content = content.replace(invitation_target, invitation_replacement)

# 2. Add Video Section
video_section = """
    <!-- VIDEO -->
    <div id="video-section" style="background:var(--cream2); padding: 40px 0;">
        <div style="max-width: 800px; margin: 0 auto; text-align: center;">
            <video src="video/IMG_3776.MOV" autoplay loop muted playsinline style="width: 100%; border-radius: 8px; box-shadow: 0 10px 30px rgba(0,0,0,0.1);"></video>
        </div>
    </div>
"""
content = content.replace('<!-- GALERIE SCROLL HORIZONTAL -->', video_section + '\n    <!-- GALERIE SCROLL HORIZONTAL -->')

# 3. Add Yendou Section
yendou_section = """
    <!-- YENDOU -->
    <div id="yendou" style="background:var(--cream2); padding: 60px 24px;">
        <section style="max-width:640px; margin:0 auto; text-align: center;">
            <p class="eyebrow">Le Programme</p>
            <h2 class="stitle">Le Yendou</h2>
            <div class="gold-line"></div>
            <p class="inv-body">Afin de prolonger ces instants de bonheur, nous aurons le plaisir de vous retrouver pour le <strong>Yendou</strong> le dimanche 26 juillet à Zac Mbao afin de clôturer ensemble ce week-end de bonheur, de partage et de célébration !</p>
        </section>
    </div>
"""
content = content.replace('<!-- RSVP -->', yendou_section + '\n    <!-- RSVP -->')

# 4. Replace PHOTOS array elements (keep the first, replace the rest)
# Find the start of the array
start_idx = content.find('const PHOTOS = [')
end_idx = content.find('];', start_idx)

if start_idx != -1 and end_idx != -1:
    array_content = content[start_idx:end_idx]
    # The first element is the first base64 string
    # We can split by '",' or '",\n'
    # Actually, we can just use regex to find all strings in the array
    strings = re.findall(r'"(data:image/jpeg;base64,[^"]+)"', array_content)
    if strings:
        first_image = strings[0]
        new_array = f'''const PHOTOS = [
            "{first_image}",
            "photos/AR506146.jpg.jpeg",
            "photos/AR506152.jpg.jpeg",
            "photos/AR506156.jpg.jpeg",
            "photos/AR506159.jpg.jpeg",
            "photos/AR506162.jpg.jpeg",
            "photos/AR506164.jpg.jpeg",
            "photos/AR506171.jpg.jpeg"
        '''
        content = content[:start_idx] + new_array + content[end_idx:]

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(content)

print("Done")
