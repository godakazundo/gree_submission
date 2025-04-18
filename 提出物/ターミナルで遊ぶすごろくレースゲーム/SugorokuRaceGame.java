import java.util.Random;
import java.util.Scanner;

// ==================== メインゲームクラス ====================
public class SugorokuRaceGame {
    static int maxMass = 21;  // ゴールの位置

    public static void main(String[] args) {
        try (Scanner scanner = new Scanner(System.in)) {
            Random random = new Random();

            System.out.println("すごろくゲームへようこそ!");
            System.out.println("プレイヤーは最大4人まで参加できます。");

            int numPlayers = 0;
            boolean validInput = false;

            // プレイヤー人数入力処理
            while (!validInput) {
                System.out.print("プレイヤーの人数（1から4人まで）を入力してください: ");
                try {
                    numPlayers = scanner.nextInt();
                    if (numPlayers < 1 || numPlayers > 4) {
                        throw new OutOfRangeException("入力された値は範囲外です！（1～4人のみ）");
                    }
                    validInput = true;
                } catch (OutOfRangeException e) {
                    System.out.println(e.getMessage());
                    scanner.nextLine();  // 入力バッファをクリア
                } catch (Exception e) {
                    System.out.println("入力された値は数字ではありません。");
                    scanner.nextLine();  // 入力バッファをクリア
                }
            }

            // プレイヤー配列生成
            Player[] players = new Player[numPlayers];
            for (int i = 0; i < numPlayers; i++) {
                if (i % 2 == 0) {  // 奇数番目はTortoise、偶数番目はRabbit
                    players[i] = new Tortoise();
                } else {
                    players[i] = new Rabbit();
                }
            }

            scanner.nextLine();
            boolean isGameOver = false;
            int loop = 0;
            printMass(players);

            System.out.println("Enterキーを押してゲームを開始します。");
            scanner.nextLine();

            // ゲームループ開始
            while (!isGameOver) {
                loop++;
                System.out.println("================== ループ " + loop + " ==================");

                for (int i = 0; i < numPlayers; i++) {
                    if (players[i].getPosition() >= (maxMass - 1)) continue;

                    System.out.println("----------- プレイヤー " + (i + 1) + " -----------");
                    System.out.println("プレイヤー " + (i + 1) + " (" + players[i].pType + ") の番です。");
                    System.out.print("Enterキーを押してサイコロを振ってください...");
                    scanner.nextLine();

                    int diceRoll = random.nextInt(6) + 1;
                    System.out.println("サイコロの目: " + diceRoll);

                    if (players[i].getRestFlg()) {
                        players[i].restConfirm();
                    } else {
                        if (players[i].getHitPoint() == 0) {
                            players[i].recoveryHP(diceRoll);
                        } else {
                            players[i].forward(diceRoll);
                            players[i].work(diceRoll);
                        }
                        players[i].checkPosition();
                    }

                    players[i].showStatus();
                    printMass(players);

                    // ゴール判定
                    if (players[i].getPosition() >= (maxMass - 1)) {
                        System.out.println("プレイヤー " + (i + 1) + " がゴールに到達しました!");
                        Player.goalNum++;
                        Player.showGoalNum();
                    }

                    // 全員ゴールしたか確認
                    boolean allPlayersFinished = true;
                    for (Player player : players) {
                        if (player.getPosition() < (maxMass - 1)) {
                            allPlayersFinished = false;
                            break;
                        }
                    }

                    if (allPlayersFinished) {
                        System.out.println("ゲーム終了!");
                        isGameOver = true;
                        break;
                    }
                }
            }
        }
    }

    // プレイヤーの位置を表示する
    static void printMass(Player[] players) {
			System.out.println("現在のマップ:");
	
			// 各プレイヤーごとに1列ずつ表示
			for (int i = 0; i < players.length; i++) {
					System.out.print("プレイヤー" + (i + 1) + "：");
	
					// 各マスの表示
					for (int j = 0; j < maxMass; j++) {
							// プレイヤーがゴールしたら最終マスに固定表示
							if ((players[i].getPosition() >= maxMass - 1) && j == maxMass - 1) {
									System.out.print("●");
							} else if (j == players[i].getPosition()) {
									System.out.print("●");  // プレイヤーの現在位置に○を表示
							} else {
									System.out.print("□");
							}
					}
	
					System.out.println();  // 改行して次のプレイヤーの列へ
			}
	}	
}

// ==================== プレイヤークラス ====================
class Player {
    protected int hitPoint = 10;
    protected int position = 0;
    protected String pType;
    static protected int goalNum = 0;
    private boolean restFlg = false;

    public int getHitPoint() { return hitPoint; }
    public int getPosition() { return position; }
    public boolean getRestFlg() { return restFlg; }

    public void showStatus() {
        System.out.println("現在の位置：" + position + " | 体力値：" + hitPoint);
    }

    public void forward(int diceRoll) {
        this.position += diceRoll;
    }

    public void work(int diceRoll) {
        this.hitPoint = Math.max(0, this.hitPoint - diceRoll);
    }

    static void showGoalNum() {
        System.out.println("到達人数：" + goalNum);
    }

    public void recoveryHP(int diceRoll) {
        this.hitPoint = diceRoll;
        System.out.println("体力が0なので、" + this.hitPoint + "まで回復しました。");
    }

    public void checkPosition() {
        if (this.position % 7 == 0) {
            this.restFlg = true;
            System.out.println(this.position + "マス目に止まり、次回は休みです。");
        }
    }

    public void restConfirm() {
        System.out.println("今回は休みです。");
        this.restFlg = false;
    }
}

// ==================== Rabbitクラス ====================
class Rabbit extends Player {
    Rabbit() { this.pType = "Rabbit"; }

    @Override
    public void forward(int diceRoll) {
        super.forward(diceRoll % 2 == 0 ? diceRoll : diceRoll + 2);
    }
}

// ==================== Tortoiseクラス ====================
class Tortoise extends Player {
    Tortoise() { this.pType = "Tortoise"; }

    @Override
    public void work(int diceRoll) {
        super.work(diceRoll % 2 == 0 ? diceRoll - 2 : diceRoll);
    }
}

// ==================== 例外クラス ====================
class OutOfRangeException extends Exception {
    OutOfRangeException(String message) { super(message); }
}