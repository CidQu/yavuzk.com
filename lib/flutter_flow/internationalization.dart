import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:flutter/foundation.dart';
import 'package:shared_preferences/shared_preferences.dart';

const _kLocaleStorageKey = '__locale_key__';

class FFLocalizations {
  FFLocalizations(this.locale);

  final Locale locale;

  static FFLocalizations of(BuildContext context) =>
      Localizations.of<FFLocalizations>(context, FFLocalizations)!;

  static List<String> languages() => ['en', 'tr', 'nl'];

  static late SharedPreferences _prefs;
  static Future initialize() async =>
      _prefs = await SharedPreferences.getInstance();
  static Future storeLocale(String locale) =>
      _prefs.setString(_kLocaleStorageKey, locale);
  static Locale? getStoredLocale() {
    final locale = _prefs.getString(_kLocaleStorageKey);
    return locale != null && locale.isNotEmpty ? createLocale(locale) : null;
  }

  String get languageCode => locale.toString();
  String? get languageShortCode =>
      _languagesWithShortCode.contains(locale.toString())
          ? '${locale.toString()}_short'
          : null;
  int get languageIndex => languages().contains(languageCode)
      ? languages().indexOf(languageCode)
      : 0;

  String getText(String key) =>
      (kTranslationsMap[key] ?? {})[locale.toString()] ?? '';

  String getVariableText({
    String? enText = '',
    String? trText = '',
    String? nlText = '',
  }) =>
      [enText, trText, nlText][languageIndex] ?? '';

  static const Set<String> _languagesWithShortCode = {
    'ar',
    'az',
    'ca',
    'cs',
    'da',
    'de',
    'dv',
    'en',
    'es',
    'et',
    'fi',
    'fr',
    'gr',
    'he',
    'hi',
    'hu',
    'it',
    'km',
    'ku',
    'mn',
    'ms',
    'no',
    'pt',
    'ro',
    'ru',
    'rw',
    'sv',
    'th',
    'uk',
    'vi',
  };
}

/// Used if the locale is not supported by GlobalMaterialLocalizations.
class FallbackMaterialLocalizationDelegate
    extends LocalizationsDelegate<MaterialLocalizations> {
  const FallbackMaterialLocalizationDelegate();

  @override
  bool isSupported(Locale locale) => _isSupportedLocale(locale);

  @override
  Future<MaterialLocalizations> load(Locale locale) async =>
      SynchronousFuture<MaterialLocalizations>(
        const DefaultMaterialLocalizations(),
      );

  @override
  bool shouldReload(FallbackMaterialLocalizationDelegate old) => false;
}

/// Used if the locale is not supported by GlobalCupertinoLocalizations.
class FallbackCupertinoLocalizationDelegate
    extends LocalizationsDelegate<CupertinoLocalizations> {
  const FallbackCupertinoLocalizationDelegate();

  @override
  bool isSupported(Locale locale) => _isSupportedLocale(locale);

  @override
  Future<CupertinoLocalizations> load(Locale locale) =>
      SynchronousFuture<CupertinoLocalizations>(
        const DefaultCupertinoLocalizations(),
      );

  @override
  bool shouldReload(FallbackCupertinoLocalizationDelegate old) => false;
}

class FFLocalizationsDelegate extends LocalizationsDelegate<FFLocalizations> {
  const FFLocalizationsDelegate();

  @override
  bool isSupported(Locale locale) => _isSupportedLocale(locale);

  @override
  Future<FFLocalizations> load(Locale locale) =>
      SynchronousFuture<FFLocalizations>(FFLocalizations(locale));

  @override
  bool shouldReload(FFLocalizationsDelegate old) => false;
}

Locale createLocale(String language) => language.contains('_')
    ? Locale.fromSubtags(
        languageCode: language.split('_').first,
        scriptCode: language.split('_').last,
      )
    : Locale(language);

bool _isSupportedLocale(Locale locale) {
  final language = locale.toString();
  return FFLocalizations.languages().contains(
    language.endsWith('_')
        ? language.substring(0, language.length - 1)
        : language,
  );
}

final kTranslationsMap = <Map<String, Map<String, String>>>[
  // HomePage
  {
    '2zc38qby': {
      'en': 'Hi! My name is',
      'nl': 'Hoi! Mijn naam is',
      'tr': 'Merhabalar ben',
    },
    'uiwm9ux4': {
      'en': 'Yavuz.',
      'nl': 'Yavuz.',
      'tr': 'Yavuz.',
    },
    'm8aoxw8n': {
      'en': 'GitHub Stars:',
      'nl': 'GitHub Sterren:',
      'tr': 'GitHub Yıldızı:',
    },
    'ctf9bd2g': {
      'en': 'GitHub Repo:',
      'nl': 'GitHub Repo:',
      'tr': 'GitHub Repo:',
    },
    'z2ovz82h': {
      'en': 'GitHub Commit:',
      'nl': 'GitHub Commit:',
      'tr': 'GitHub Commit:',
    },
    'wdyv5zui': {
      'en': '232',
      'nl': '232',
      'tr': '232',
    },
    'ks8d3fyc': {
      'en': 'GitHub Followers:',
      'nl': 'GitHub Volgers:',
      'tr': 'GitHub Takipçi:',
    },
    'ezjwvsoo': {
      'en': 'Projects',
      'nl': 'Projecten',
      'tr': 'Projelerim',
    },
    '1xhundca': {
      'en': 'Contact Me',
      'nl': 'Contact',
      'tr': 'Bana Ulaşın',
    },
    'vo6pfazd': {
      'en': 'About Me',
      'nl': 'Over Mij',
      'tr': 'Hakkımda',
    },
    'meurc5ww': {
      'en': 'CV',
      'nl': 'CV',
      'tr': 'CV',
    },
    'uurh0c3k': {
      'en': 'My Translations',
      'nl': 'Mijn Vertalingen',
      'tr': 'Çevirilerim',
    },
    '2md6j0g0': {
      'en': 'Home',
      'nl': 'Home',
      'tr': 'Home',
    },
  },
  // hakkimda
  {
    'mt2hlzom': {
      'en': 'About Me',
      'nl': 'Over Mij',
      'tr': 'Hakkımda',
    },
    'iaw9a94h': {
      'en': 'Yavuz Selimhan Kaya',
      'nl': 'Yavuz Selimhan Kaya',
      'tr': 'Yavuz Selimhan Kaya',
    },
    'f0z1aol1': {
      'en': 'About Me',
      'nl': 'Over Mij',
      'tr': 'Hakkımda',
    },
    'gaup7ys2': {
      'en':
          'I\'m Yavuz, if I haven\'t forgotten to update the site, I\'m currently studying Computer Engineering at Radboud University. My familiarity with computers comes from my childhood. I started to develop myself in software in High School Preparatory. My adventure, which I started with small projects and then with the game I developed myself, has now taken a very different dimension. I realized that my interests are in different directions.',
      'nl':
          'Ik ben Yavuz, als ik niet vergeten ben de site bij te werken, ik studeer momenteel Computer Engineering aan de Radboud Universiteit. Mijn bekendheid met computers komt uit mijn kindertijd. Ik begon mezelf te ontwikkelen in software op de middelbare school. Mijn avontuur, dat ik begon met kleine projecten en daarna met het spel dat ik zelf ontwikkelde, heeft nu een heel andere dimensie gekregen. Ik realiseerde me dat mijn interesses in verschillende richtingen liggen.',
      'tr':
          'Ben Yavuz, eğer siteyi güncellemeyi unutmadıysam şu an Radboud Üniversitesinde Bilgisayar Mühendisliği okuyorum. Bilgisayarlarla aşinalığım küçüklüğümden geliyor. Yazılım konusunda kendimi geliştirmeye Lise Hazırlıkta başladım. Önce küçük projeler ile daha sonrasında ise kendi geliştirdiğim oyun ile atıldığım maceram şu anda çok ayrı bir boyut aldı. İlgilerimin farklı yönlerde olduğunu anladım.',
    },
    'xc5g20oz': {
      'en': 'Flutter',
      'nl': 'Flutter',
      'tr': 'Flutter',
    },
    '52e2q85m': {
      'en':
          'In 9th grade, I met Flutter to design an application as a Tübitak project. First, I developed an application with ready-made templates on the internet. Later, when I was done with Tübitak, I started to create the application from scratch with Firestore. Later, I improved myself and published a lot of Flutter application on the App Store and Google Play. The website you are viewing right now was created on Flutter! At the same time, all of my game patch setups were created on Flutter! Every day I feel more and more part of this blue team 💙',
      'nl':
          'In de 9e klas maakte ik kennis met Flutter om een applicatie te ontwerpen als Tübitak-project. Eerst ontwikkelde ik een applicatie met kant-en-klare sjablonen op het internet. Later, toen ik klaar was met Tübitak, begon ik de applicatie vanaf nul te maken met Firestore. Later verbeterde ik mezelf en publiceerde ik veel Flutter applicaties in de App Store en Google Play. De website die je nu bekijkt is gemaakt met Flutter! Tegelijkertijd zijn al mijn game patch setups gemaakt op Flutter! Elke dag voel ik me meer en meer deel van dit blauwe team 💙\n',
      'tr':
          '9.sınıfta Tübitak projesi olarak uygulama tasarlamak için Flutter ile tanıştım. Öncelikle internetteki hazır templateler ile bir uygulama geliştirdim. Daha sonrasında Tübitak ile işim bitince uygulamayı en baştan Firestore ile oluşturmaya başladım. Daha sonrasında kendimi geliştirip birden fazla Flutter uygulamasını App Store ve Google Play\'de yayınladım. Şu anda bu görüntülediğiniz websitesi Flutter üzerinden oluşturuldu! Aynı zamanda tüm oyun yama setuplarımın tamamı da Flutter üzerinden oluşturuldu! Her geçen gün kendimi bu mavi ekibe daha da ait hissediyorum. 💙\n\n',
    },
    'ifzycdta': {
      'en': 'Translations',
      'nl': 'Vertalingen',
      'tr': 'Çevirmenlik',
    },
    'zvulrezm': {
      'en':
          'In 2021, I found myself on game patch platforms due to the lack of Turkish language support in the video game I had just purchased. Afterwards, I took part in the Dishonored: Death Of The Outsider project as a Translator as the first task given to me. Since I enjoyed this process so much, I took on the translation of the newly released “DEATHLOOP” game by the same company myself and we started translating from scratch by creating a team. Afterwards, I embarked on bigger works such as Sunset Overdrive, Demon Slayer. We are currently continuing to work on my own forum and Discord! ceviri.cidqu.net',
      'nl':
          'In 2021 bevond ik me op gamepatchplatforms vanwege het gebrek aan Turkse taalondersteuning in het videospel dat ik net had gekocht. Daarna nam ik deel aan het Dishonored: Death Of The Outsider als vertaler als eerste opdracht. Omdat ik dit proces zo leuk vond, nam ik zelf de vertaling van de onlangs uitgebrachte game “DEATHLOOP” van hetzelfde bedrijf op me en begonnen we met vertalen vanaf nul door een team samen te stellen. Daarna begon ik aan grotere werken zoals Sunset Overdrive en Demon Slayer. Momenteel werken we verder aan mijn eigen forum en Discord! ceviri.cidqu.net\n',
      'tr':
          '2021 yılında yeni satın almış olduğum video oyununda Türkçe dil desteği olmaması sebebi ile kendimi oyun yama platforlarında buldum. Daha sonrasında ilk bana verilen görev olarak Dishonored: Death Of The Outsider projesinde Çevirmen olarak yer aldım. Bu süreçte çok zevk aldığımdan dolayı aynı şirketin yeni çıkartmış olduğu \"DEATHLOOP\" oyunun çevirisini kendim üstlendim ve bir ekip oluşturarak sıfırdan çeviri yapmaya başladık. Sonrasında Sunset Overdrive, Demon Slayer gibi daha büyük işlere giriştim. Şu anda kendi forumum ve Discordum üzerinden çalışmalara devam ediyoruz! ceviri.cidqu.net\n\n',
    },
    'iajsj0aj': {
      'en': 'Reverse Engineering',
      'nl': 'Reverse Engineering',
      'tr': 'Reverse Engineering',
    },
    '7hxzsyl1': {
      'en':
          'As my translation excitement grew, I found myself in a big problem. Opening, editing and then transferring the language files of the games back to the game was a huge problem. This required a high level of software knowledge. Although many people helped me on the Zenhax and Xentax forums, I felt that I had to find a way myself. By researching from many sources on the internet, I acquired basic knowledge such as Table Offset Pointer. Later, thanks to anonymous users such as Lucy, h3x3r, I found myself in the middle of the education field. After more than 2 years of these experiments, I learned to open and edit files, especially games, with Reverse Engineering methods. The first tool I developed myself was the Plague Tale Requiem Font Tool. After that, I continued my learning by developing a lot of tools both on GitHub and privately and I am still learning.\n',
      'nl':
          'Terwijl mijn vertaalenthousiasme groeide, kwam ik voor een groot probleem te staan. Het openen, bewerken en vervolgens terugzetten van de taalbestanden van de spellen naar het spel was een enorm probleem. Dit vereiste veel softwarekennis. Hoewel veel mensen me hielpen op de forums van Zenhax en Xentax, vond ik dat ik zelf een manier moest vinden. Door vele bronnen op het internet te onderzoeken, verwierf ik basiskennis zoals Table Offset Pointer. Later, dankzij anonieme gebruikers zoals Lucy, h3x3r, kwam ik midden in het onderwijsveld terecht. Na meer dan 2 jaar van deze experimenten, leerde ik om bestanden te openen en te bewerken, vooral spelletjes, met Reverse Engineering methodes. De eerste tool die ik zelf ontwikkelde was de Plague Tale Requiem Font Tool. Daarna heb ik verder geleerd door veel tools te ontwikkelen, zowel op GitHub als privé, en ik leer nog steeds.\n',
      'tr':
          'Çeviri heyecanımın ilerlemesi ile beraber kendimi büyük bir problemin içerisinde buldum. Oyunların dil dosyalarını açmak, düzenlemek ve sonrasında oyun geri aktarmak çok büyük bir problemdi. Bunun için üst düzey yazılım bilgisi gerekiyordu. Zenhax ve Xentax forumlarında çoğu kişi yardım etse de artık kendimin bir yolunu bulmam gerektiğini hissetmişim. İnternetteki bit çok kaynaktan araştırmalar yaparak, Table Offset Pointer gibi temel bilgileri edindim. Daha sonrasında Lucy, h3x3r gibi anonim kullanıcılar sayesinde kendimi eğitim alanının ortasında bulmuştum. 2 Yılı aşkındır devam eden bu denemeler sayesinde artık dosyaları özellikle oyunları Reverse Engineering methodları ile açmayı düzenlemeyi öğrendim. Kendi geliştirdiğim ilk araç Plague Tale Requiem Font Aracı oldu. Daha sonrasında hem GitHub üzerinde hem de özel bir şekilde çokça araç geliştirerek öğrenimime devam ettim ve hala etmekteyim.\n\n',
    },
    't9zrdgv5': {
      'en': 'FRC, VRC, and TEKNOFEST',
      'nl': 'FRC, VRC, en TEKNOFEST',
      'tr': 'FRC, VRC ve TEKNOFEST',
    },
    '2l6027ri': {
      'en':
          'In March 2022, we participated in the FRC Istanbul Regional Tournament, where I was the software captain and we became the champion and qualified for the grand finals in Houston! In the VRC Istanbul tournament, which we entered right after that, we became Finalists and returned home with four different special awards. In July of the same year, we made it to the Final of the TUBITAK 2204-C Polar Research Projects. We went to Giresun for the Final Tournament and came back home with 3rd place! Then, in August, we were selected as one of the top 10 projects in the TEKNOFEST Technology for the Benefit of Humanity Final in Rize and in the Turkish Natural Language Processing competition held in the same month, my team and I came 9th in Turkey. We celebrated all of these achievements at TEKNOFEST KARADENIZ in September 2022!',
      'nl':
          'In maart 2022 namen we deel aan het FRC Istanbul Regional Tournament, waar ik de software captain was en we kampioen werden en ons kwalificeerden voor de grote finale in Houston! In het VRC Istanbul toernooi, waar we vlak daarna aan meededen, werden we finalisten en keerden we huiswaarts met vier verschillende speciale prijzen. In juli van datzelfde jaar haalden we de finale van de TUBITAK 2204-C Polar Research Projects. We gingen naar Giresun voor het finaletoernooi en kwamen thuis met de 3e plaats! In augustus werden we geselecteerd als een van de top 10 projecten in de TEKNOFEST Technology for the Benefit of Humanity finale in Rize en in de Turkish Natural Language Processing competitie die in dezelfde maand werd gehouden, werden mijn team en ik 9e in Turkije. We vierden al deze prestaties op TEKNOFEST KARADENIZ in september 2022!\n',
      'tr':
          '2022 Yılının Mart ayında FRC İstanbul Regional Turnuvasında katıldık, yazılım kaptanlığını üstendiğim turnuvada şampiyon olup Houston\'daki büyük finale girmeye hak kazandık! Hemen onun peşine girmiş olduğumuz VRC İstanbul turnuvasında ise Finalist olup dört farklı özel ödül ile evimize geri döndük. Aynı senenin Temmuz ayında TÜBİTAK 2204-C Kutup Araştırma Projelerinde Finale kaldık. Final Turnuvası için Giresun\'a gittik ve 3.lük alarak evimize geri döndük! Sonrasında Ağustos ayında Rize\'de TEKNOFEST İnsanlık Yararına Teknoloji Finalinde en iyi 10 projeden biri seçildik ve aynı ay içerisinde gerçekleşen Türkçe Doğal Dil İşleme yarışmasında takımımla birlikte Türkiye 9.su olduk. Bu başarıların hepsini 2022 Eylül\'de TEKNOFEST KARADENİZ\'de kutladık!\n\n',
    },
    'ksc1h3vk': {
      'en': 'Photos',
      'nl': 'Fotos',
      'tr': 'Fotoğraflar',
    },
    '0q0626om': {
      'en': 'These photos are old, I\'ve lost a lot of weight. :\') (-65kg)',
      'nl': 'Deze foto\'s zijn oud, ik ben veel afgevallen :\') (-65kg)',
      'tr': 'Bu fotoğraflar eski, baya bi kilo verdim. :\') (-65kg)',
    },
    'ycmxdy2e': {
      'en': 'Home',
      'nl': 'Home',
      'tr': 'Home',
    },
  },
  // cv_page
  {
    'tqg10wtp': {
      'en': 'CV',
      'nl': 'CV',
      'tr': 'CV',
    },
    'vakzftfg': {
      'en': 'Home',
      'nl': 'Home',
      'tr': 'Home',
    },
  },
  // proje
  {
    'a12egi9x': {
      'en': 'Projects',
      'nl': 'Projecten',
      'tr': 'Projelerim',
    },
    '7rowps2b': {
      'en': 'Home',
      'nl': 'Home',
      'tr': 'Home',
    },
  },
  // Miscellaneous
  {
    'vdtf80h0': {
      'en': '',
      'nl': '',
      'tr': '',
    },
    '6gp8nmyl': {
      'en': '',
      'nl': '',
      'tr': '',
    },
    'b07b1s6s': {
      'en': '',
      'nl': '',
      'tr': '',
    },
    'n0c6hgdb': {
      'en': '',
      'nl': '',
      'tr': '',
    },
    'cwltfvvw': {
      'en': '',
      'nl': '',
      'tr': '',
    },
    '3d2nsjlb': {
      'en': '',
      'nl': '',
      'tr': '',
    },
    'vk15nbf3': {
      'en': '',
      'nl': '',
      'tr': '',
    },
    'y2inu03e': {
      'en': '',
      'nl': '',
      'tr': '',
    },
    'cn108u4v': {
      'en': '',
      'nl': '',
      'tr': '',
    },
    'mqr9hzk8': {
      'en': '',
      'nl': '',
      'tr': '',
    },
    'v0imisp7': {
      'en': '',
      'nl': '',
      'tr': '',
    },
    'xqm58kbd': {
      'en': '',
      'nl': '',
      'tr': '',
    },
    '177qp1fw': {
      'en': '',
      'nl': '',
      'tr': '',
    },
    'o7vqmd0y': {
      'en': '',
      'nl': '',
      'tr': '',
    },
    't2d6dt0y': {
      'en': '',
      'nl': '',
      'tr': '',
    },
    '8sxcwxeu': {
      'en': '',
      'nl': '',
      'tr': '',
    },
    'vbfnviwi': {
      'en': '',
      'nl': '',
      'tr': '',
    },
    'u06qnutx': {
      'en': '',
      'nl': '',
      'tr': '',
    },
    'c3uzn1rx': {
      'en': '',
      'nl': '',
      'tr': '',
    },
    'r49pk7n8': {
      'en': '',
      'nl': '',
      'tr': '',
    },
    'pyrrekgp': {
      'en': '',
      'nl': '',
      'tr': '',
    },
    'r5cdbo1c': {
      'en': '',
      'nl': '',
      'tr': '',
    },
    'n3b8dsh7': {
      'en': '',
      'nl': '',
      'tr': '',
    },
    'ytkhnwdm': {
      'en': '',
      'nl': '',
      'tr': '',
    },
    'ojw6bnl5': {
      'en': '',
      'nl': '',
      'tr': '',
    },
  },
].reduce((a, b) => a..addAll(b));
